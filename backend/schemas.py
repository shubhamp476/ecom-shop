"""Pydantic validation preserves the existing UI's field names and status values."""
import re
from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal
from uuid import uuid4
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

Text = Annotated[str, Field(min_length=1, max_length=500)]
Money = Annotated[float, Field(ge=0, allow_inf_nan=False)]
Count = Annotated[int, Field(ge=0)]

def slugify(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')

class Document(BaseModel):
    model_config = ConfigDict(extra='ignore', str_strip_whitespace=True, allow_inf_nan=False)

class Spec(Document):
    label: Text
    value: Text
    group: str = ''
    unit: str = ''

class Variant(Document):
    id: Text
    sku: Text
    name: Text
    attributes: dict[str, str] = Field(default_factory=dict)
    mrp: Money
    price: Money
    costPrice: Money = 0
    stock: Count = 0
    reservedStock: Count = 0
    image: str = ''
    barcode: str = ''
    status: Literal['Active', 'Inactive', 'Out of Stock'] = 'Active'

class ProductInput(Document):
    name: Text
    category: Text
    price: Annotated[float, Field(gt=0, allow_inf_nan=False)]
    slug: str = ''
    sku: str = ''
    categorySlug: str = ''
    brand: str = 'Givolt'
    brandSlug: str = ''
    description: str = ''
    shortDescription: str = ''
    subcategory: str = ''
    productType: str = ''
    manufacturer: str = ''
    modelNumber: str = ''
    partNumber: str = ''
    barcode: str = ''
    countryOfOrigin: str = 'India'
    warrantyDuration: str = ''
    warrantyTerms: str = ''
    boxContents: list[str] = Field(default_factory=list)
    condition: Literal['New', 'Refurbished', 'Used'] = 'New'
    status: Literal['Draft', 'Active', 'Inactive', 'Archived', 'Out of Stock'] = 'Active'
    featured: bool = False
    newArrival: bool = False
    bestSeller: bool = False
    image: str = '/assets/69d4a654a45341b80906ff1c_1.avif'
    gallery: list[str] = Field(default_factory=list)
    mrp: Money = 0
    costPrice: Money = 0
    taxRate: Annotated[float, Field(ge=0, le=100)] = 18
    hsnCode: str = ''
    currency: Literal['INR', 'USD', 'EUR'] = 'INR'
    stock: Count = 0
    reservedStock: Count = 0
    reorderLevel: Count = 5
    restockQuantity: Count = 0
    warehouseLocation: str = ''
    weight: Money = 0
    packageWeight: Money = 0
    dimensions: dict[str, Money] = Field(default_factory=dict)
    shippingClass: str = 'Standard Electronics'
    isFragile: bool = False
    codEligible: bool = True
    freeShipping: bool = False
    metaTitle: str = ''
    metaDescription: str = ''
    keywords: list[str] = Field(default_factory=list)
    canonicalUrl: str = ''
    specs: list[Spec] = Field(default_factory=list)
    variants: list[Variant] = Field(default_factory=list)
    rating: Annotated[float, Field(ge=0, le=5)] = 0
    reviewsCount: Count = 0
    tag: str = ''

    @model_validator(mode='after')
    def normalize(self):
        self.slug = self.slug or slugify(self.name)
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', self.slug):
            raise ValueError('Slug must contain lowercase letters, digits and single hyphens')
        self.sku = self.sku or 'GV-' + uuid4().hex[:12].upper()
        self.categorySlug = self.categorySlug or slugify(self.category)
        self.brandSlug = self.brandSlug or slugify(self.brand)
        self.mrp = self.mrp or self.price
        if self.mrp < self.price:
            raise ValueError('MRP cannot be lower than selling price')
        if self.reservedStock > self.stock:
            raise ValueError('Reserved stock cannot exceed stock')
        if not self.gallery:
            self.gallery = [self.image]
        return self

    def document(self):
        data = self.model_dump()
        data.update(availableStock=self.stock-self.reservedStock,
                    inStock=self.stock > self.reservedStock,
                    discountAmount=round(self.mrp-self.price, 2),
                    discountPercentage=round((self.mrp-self.price)/self.mrp*100),
                    originalPrice=self.mrp)
        return data

class CategoryInput(Document):
    name: Text
    slug: str = ''
    parentId: str | None = None
    image: str = '/assets/69d13b078880cdeb9b2b2fc9_2.avif'
    bannerImage: str = ''
    count: str = '0 items'
    description: str = ''
    sortOrder: int = 0
    status: Literal['Active', 'Inactive'] = 'Active'
    specTemplate: list[str] = Field(default_factory=list)
    metaTitle: str = ''
    metaDescription: str = ''

    @model_validator(mode='after')
    def normalize(self):
        self.slug = self.slug or slugify(self.name)
        if not self.slug: raise ValueError('A category slug is required')
        return self

class BrandInput(Document):
    name: Text
    slug: str = ''
    logo: str = '/assets/69d13b078880cdeb9b2b2fc9_2.avif'
    banner: str = ''
    description: str = ''
    website: str = ''
    countryOfOrigin: str = ''
    warrantyPolicy: str = ''
    supportEmail: str = ''
    supportPhone: str = ''
    status: Literal['Active', 'Inactive'] = 'Active'
    featured: bool = False
    productCount: Count = 0

    @model_validator(mode='after')
    def normalize(self):
        self.slug = self.slug or slugify(self.name)
        if not self.slug: raise ValueError('A brand slug is required')
        return self

class CustomerInput(Document):
    name: Text
    email: Text
    phone: Text
    city: str = ''
    state: str = ''
    country: str = 'India'
    totalOrders: Count = 0
    totalSpent: Money = 0
    status: Literal['Active', 'Inactive', 'Blocked'] = 'Active'
    tier: Literal['Standard', 'Silver', 'Gold', 'VIP'] = 'Standard'
    notes: str = ''

    @field_validator('email')
    @classmethod
    def email_valid(cls, value):
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', value):
            raise ValueError('A valid email address is required')
        return value.lower()

class CouponInput(Document):
    code: Text
    description: str = ''
    discountType: Literal['percentage', 'fixed'] = 'percentage'
    discountValue: Annotated[float, Field(gt=0)]
    minOrderValue: Money = 0
    maxDiscountAmount: Money | None = None
    usageLimit: Count = 500
    usedCount: Count = 0
    startDate: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    endDate: datetime = Field(default_factory=lambda: datetime.now(timezone.utc)+timedelta(days=30))
    status: Literal['Active', 'Expired', 'Disabled'] = 'Active'

    @model_validator(mode='after')
    def normalize(self):
        self.code = self.code.upper()
        self.startDate = self.startDate.replace(tzinfo=self.startDate.tzinfo or timezone.utc)
        self.endDate = self.endDate.replace(tzinfo=self.endDate.tzinfo or timezone.utc)
        if self.endDate <= self.startDate: raise ValueError('End date must be after start date')
        if self.discountType == 'percentage' and self.discountValue > 100: raise ValueError('Percentage cannot exceed 100')
        return self

class SupplierInput(Document):
    name: Text
    companyName: Text
    email: str = ''
    phone: str = ''
    gstin: str = ''
    address: str = ''
    city: str = ''
    state: str = ''
    brandsSupplied: list[str] = Field(default_factory=list)
    paymentTerms: str = 'Net 30'
    status: Literal['Active', 'Inactive'] = 'Active'
    rating: Annotated[float, Field(ge=0, le=5)] = 0

class SettingsInput(Document):
    storeName: str = 'Givolt Electronics'
    storeTagline: str = 'Smart Tech for Smarter Living'
    currency: Literal['INR', 'USD', 'EUR'] = 'INR'
    currencySymbol: str = '₹'
    defaultTaxRate: Annotated[float, Field(ge=0, le=100)] = 18
    lowStockThreshold: Count = 5
    freeShippingThreshold: Money = 50
    defaultShippingCost: Money = 0
    codEnabled: bool = True
    supportEmail: str = ''
    supportPhone: str = ''
    orderPrefix: str = 'GV-'
    maintenanceMode: bool = False

class OrderPatch(Document):
    orderNumber: Text
    fulfillmentStatus: Literal['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'] | None = None
    paymentStatus: Literal['Pending', 'Paid', 'Failed', 'Refunded'] | None = None
    trackingNumber: str | None = None
    shippingCarrier: str | None = None
    adminNotes: str | None = None

class InventoryAdjustment(Document):
    productId: Text
    quantityChange: int
    reason: Text
    actor: str = 'Super Admin'
    type: Literal['stock_in', 'stock_out', 'adjustment', 'order', 'return'] = 'adjustment'

class ImportInput(Document):
    csvContent: Annotated[str, Field(min_length=1, max_length=2_000_000)]
    commit: bool = False
