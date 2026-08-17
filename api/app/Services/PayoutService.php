<?php

namespace App\Services;

use App\Enums\PayoutStatus;
use App\Enums\WalletTransactionType;
use App\Models\PayoutRequest;
use App\Models\Vendor;
use App\Models\VendorWallet;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayoutService
{
    /**
     * Vendor submits a payout request.
     */
    public function requestPayout(Vendor $vendor, float $amount, string $payoutMethod, array $payoutAccountDetails): PayoutRequest
    {
        return DB::transaction(function () use ($vendor, $amount, $payoutMethod, $payoutAccountDetails) {
            $wallet = VendorWallet::firstOrCreate(
                ['vendor_id' => $vendor->id],
                ['balance' => 0, 'holding_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
            );

            if ($wallet->balance < $amount) {
                throw ValidationException::withMessages([
                    'amount' => ['Requested amount exceeds available wallet balance.'],
                ]);
            }

            // Deduct available balance
            $balanceBefore = $wallet->balance;
            $wallet->decrement('balance', $amount);

            $payout = PayoutRequest::create([
                'vendor_id' => $vendor->id,
                'amount' => $amount,
                'payout_method' => $payoutMethod,
                'payout_account_details' => $payoutAccountDetails,
                'status' => PayoutStatus::PENDING,
            ]);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => WalletTransactionType::PAYOUT,
                'amount' => -$amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'reference_type' => PayoutRequest::class,
                'reference_id' => $payout->id,
                'description' => "Payout request #{$payout->id}",
            ]);

            return $payout;
        });
    }

    /**
     * Admin processes payout (approve/process/reject).
     */
    public function processPayout(PayoutRequest $payout, PayoutStatus $status, ?string $adminNote = null): PayoutRequest
    {
        return DB::transaction(function () use ($payout, $status, $adminNote) {
            $wallet = $payout->vendor->wallet;

            if ($status === PayoutStatus::REJECTED && $payout->status !== PayoutStatus::REJECTED) {
                // Refund money back to vendor wallet
                $balanceBefore = $wallet->balance;
                $wallet->increment('balance', $payout->amount);

                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => WalletTransactionType::REFUND_DEDUCTION,
                    'amount' => $payout->amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $wallet->balance,
                    'reference_type' => PayoutRequest::class,
                    'reference_id' => $payout->id,
                    'description' => "Refund for rejected payout #{$payout->id}: {$adminNote}",
                ]);
            } elseif ($status === PayoutStatus::PROCESSED) {
                $wallet->increment('total_withdrawn', $payout->amount);
            }

            $payout->update([
                'status' => $status,
                'admin_note' => $adminNote,
                'processed_at' => Carbon::now(),
            ]);

            return $payout;
        });
    }
}
