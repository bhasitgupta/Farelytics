/**
 * Type declarations for Farelytics API response structures.
 */

export interface NationalIndexResponse {
  index: number;
  period: string;
  base_period: string;
  coverage: number;
  weight_source: string;
  decomposition?: {
    trend?: number;
    carrier_mix?: number;
    distance?: number;
    advance_purchase?: number;
  };
}

export interface RouteIndexItem {
  route: string;
  weight: number;
  current_price: number;
  base_price: number;
  price_relative: number;
}

export interface FareObservation {
  id: string;
  route: string;
  airline: string;
  flight_number: string;
  travel_date: string;
  lead_time: number;
  total_fare: number;
  base_fare: number;
  taxes_fees: number;
  is_outlier: boolean;
  is_sold_out: boolean;
  collected_at: string;
}
