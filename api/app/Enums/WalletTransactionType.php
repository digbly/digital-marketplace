<?php

namespace App\Enums;

enum WalletTransactionType: string
{
    case ORDER_EARNING = 'order_earning';
    case COMMISSION_DEDUCTION = 'commission_deduction';
    case PAYOUT = 'payout';
    case REFUND_DEDUCTION = 'refund_deduction';
}
