# Farelytics Index Methodology & Statistical Formulation

## 1. Introduction & CPI Alignment

Farelytics computes a Laspeyres-type chained price index designed to reflect changes in the domestic passenger air transport component of the Consumer Price Index (CPI). 

## 2. Route Basket Selection & Weighting

Seven high-density domestic trunk routes are selected based on DGCA annual passenger volume statistics. Route weight $w_r$ is determined by:

$$w_r = \frac{\text{Annual Passenger Volume}_r}{\sum_{k \in \mathcal{R}} \text{Annual Passenger Volume}_k}$$

Where $\sum_{r \in \mathcal{R}} w_r = 1.00000$.

## 3. Elementary Price Aggregation (Jevons Formula)

For route $r$, advance horizon $h \in \{1, 7, 15, 30, 45\}$, and observation period $t$, the representative fare $P(r, h, t)$ is derived from the geometric mean (or median) of valid carrier quotes:

$$P(r, h, t) = \left( \prod_{i=1}^{n_{r,h,t}} p_{i,r,h,t} \right)^{\frac{1}{n_{r,h,t}}}$$

## 4. Advance Purchase Horizon Weighting

Prices are collected across 5 horizons to capture dynamic yield curve shifts. Weights are allocated according to booking distribution curves:
- $T+1$ (Emergency/Last-minute): 15%
- $T+7$ (Near-term business): 25%
- $T+15$ (Standard leisure/business): 30%
- $T+30$ (Planned travel): 20%
- $T+45$ (Early bird booking): 10%

## 5. Composite National Index

$$I_t = \sum_{r \in \mathcal{R}} w_r \cdot \left( \frac{P(r, t)}{P(r, 0)} \right) \times 100$$

Where $P(r,0)$ denotes the base period representative fare.

## 6. Outlier Handling: Interquartile Range (IQR)

Observations outside $[Q_1 - 1.5 \times \text{IQR}, Q_3 + 1.5 \times \text{IQR}]$ are flagged with `is_outlier = true` for analyst review without data discarding.
