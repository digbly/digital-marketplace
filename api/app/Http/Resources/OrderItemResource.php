<?php

namespace App\Http\Resources;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read OrderItem $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "product_name", "product_type", "price", "status"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "order_id", type: "string", format: "uuid"),
        new OA\Property(property: "product_id", type: "string", format: "uuid"),
        new OA\Property(property: "vendor_id", type: "string", format: "uuid"),
        new OA\Property(property: "product_name", type: "string"),
        new OA\Property(property: "product_type", type: "string"),
        new OA\Property(property: "price", type: "number", format: "float"),
        new OA\Property(property: "status", type: "string"),
    ]
)]
class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'order_id' => $this->resource->order_id,
            'product_id' => $this->resource->product_id,
            'vendor_id' => $this->resource->vendor_id,
            'product_name' => $this->resource->product_name,
            'product_type' => $this->resource->product_type,
            'price' => (float) $this->resource->price,
            'status' => $this->resource->status,
            'product' => new ProductResource($this->whenLoaded('product')),
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
            'downloads' => OrderDownloadResource::collection($this->whenLoaded('downloads')),
            'license_key' => new ProductLicenseKeyResource($this->whenLoaded('licenseKey')),
        ];
    }
}
