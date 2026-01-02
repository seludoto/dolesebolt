export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'buyer' | 'seller' | 'admin';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'suspended';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sellers: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_type: string;
          description: string;
          logo_url: string | null;
          verification_status: VerificationStatus;
          trust_score: number;
          total_sales: number;
          commission_rate: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          business_type?: string;
          description?: string;
          logo_url?: string | null;
          verification_status?: VerificationStatus;
          trust_score?: number;
          total_sales?: number;
          commission_rate?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_type?: string;
          description?: string;
          logo_url?: string | null;
          verification_status?: VerificationStatus;
          trust_score?: number;
          total_sales?: number;
          commission_rate?: number;
          status?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          description: string;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          description?: string;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          description?: string;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string;
          base_price: number;
          currency: string;
          status: ProductStatus;
          featured: boolean;
          view_count: number;
          sales_count: number;
          rating_average: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string;
          base_price: number;
          currency?: string;
          status?: ProductStatus;
          featured?: boolean;
          view_count?: number;
          sales_count?: number;
          rating_average?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string;
          base_price?: number;
          currency?: string;
          status?: ProductStatus;
          featured?: boolean;
          view_count?: number;
          sales_count?: number;
          rating_average?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          sort_order: number;
          is_primary: boolean;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          sort_order?: number;
          is_primary?: boolean;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          sort_order?: number;
          is_primary?: boolean;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          name: string;
          attributes: Json;
          price: number;
          stock_quantity: number;
          status: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          name: string;
          attributes?: Json;
          price: number;
          stock_quantity?: number;
          status?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string;
          name?: string;
          attributes?: Json;
          price?: number;
          stock_quantity?: number;
          status?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          buyer_id: string;
          total_amount: number;
          currency: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          shipping_address: Json;
          billing_address: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          buyer_id: string;
          total_amount: number;
          currency?: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          shipping_address: Json;
          billing_address: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          buyer_id?: string;
          total_amount?: number;
          currency?: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          shipping_address?: Json;
          billing_address?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          seller_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          commission_amount: number;
          status: string;
          tracking_number: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          seller_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          commission_amount?: number;
          status?: string;
          tracking_number?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          seller_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          commission_amount?: number;
          status?: string;
          tracking_number?: string | null;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_item_id: string | null;
          rating: number;
          title: string;
          comment: string;
          verified_purchase: boolean;
          helpful_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          order_item_id?: string | null;
          rating: number;
          title?: string;
          comment?: string;
          verified_purchase?: boolean;
          helpful_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          order_item_id?: string | null;
          rating?: number;
          title?: string;
          comment?: string;
          verified_purchase?: boolean;
          helpful_count?: number;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2?: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          address_line1?: string;
          address_line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };

      seller_documents: {
        Row: {
          id: string;
          seller_id: string;
          document_type: string;
          document_url: string;
          verification_status: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          document_type: string;
          document_url: string;
          verification_status?: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          document_type?: string;
          document_url?: string;
          verification_status?: string;
          uploaded_at?: string;
        };
      };

      seller_reviews: {
        Row: {
          id: string;
          seller_id: string;
          user_id: string;
          order_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          user_id: string;
          order_id: string;
          rating: number;
          comment?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          user_id?: string;
          order_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
      };

      transactions: {
        Row: {
          id: string;
          order_id: string;
          transaction_type: string;
          amount: number;
          currency: string;
          payment_method: string;
          status: string;
          gateway_reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          transaction_type: string;
          amount: number;
          currency?: string;
          payment_method?: string;
          status?: string;
          gateway_reference?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          transaction_type?: string;
          amount?: number;
          currency?: string;
          payment_method?: string;
          status?: string;
          gateway_reference?: string | null;
          created_at?: string;
        };
      };

      seller_payouts: {
        Row: {
          id: string;
          seller_id: string;
          amount: number;
          currency: string;
          status: string;
          payout_date: string | null;
          reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          amount: number;
          currency?: string;
          status?: string;
          payout_date?: string | null;
          reference?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          payout_date?: string | null;
          reference?: string | null;
          created_at?: string;
        };
      };

      disputes: {
        Row: {
          id: string;
          order_id: string;
          raised_by: string;
          dispute_type: string;
          description: string;
          status: string;
          resolution: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          raised_by: string;
          dispute_type: string;
          description: string;
          status?: string;
          resolution?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          raised_by?: string;
          dispute_type?: string;
          description?: string;
          status?: string;
          resolution?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
      };
    };
  };
}
