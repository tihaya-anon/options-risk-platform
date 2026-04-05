import { clamp, normCdf, normPdf } from "./math";
import type { Greeks, IvModel, OptionRight } from "../types";

function d1(
  spot: number,
  strike: number,
  rate: number,
  timeToExpiryYears: number,
  volatility: number
): number {
  return (
    (Math.log(spot / strike) + (rate + 0.5 * volatility * volatility) * timeToExpiryYears) /
    (volatility * Math.sqrt(timeToExpiryYears))
  );
}

function d2(
  spot: number,
  strike: number,
  rate: number,
  timeToExpiryYears: number,
  volatility: number
): number {
  return d1(spot, strike, rate, timeToExpiryYears, volatility) - volatility * Math.sqrt(timeToExpiryYears);
}

class BlackScholesModel implements IvModel {
  readonly name = "Black-Scholes";

  price(
    spot: number,
    strike: number,
    rate: number,
    timeToExpiryYears: number,
    volatility: number,
    optionType: OptionRight
  ): number {
    if (timeToExpiryYears <= 0 || volatility <= 0 || spot <= 0 || strike <= 0) {
      const intrinsic =
        optionType === "call" ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0);
      return intrinsic;
    }

    const dd1 = d1(spot, strike, rate, timeToExpiryYears, volatility);
    const dd2 = d2(spot, strike, rate, timeToExpiryYears, volatility);
    const discount = Math.exp(-rate * timeToExpiryYears);

    if (optionType === "call") {
      return spot * normCdf(dd1) - strike * discount * normCdf(dd2);
    }
    return strike * discount * normCdf(-dd2) - spot * normCdf(-dd1);
  }

  greeks(
    spot: number,
    strike: number,
    rate: number,
    timeToExpiryYears: number,
    volatility: number,
    optionType: OptionRight
  ): Greeks {
    const price = this.price(spot, strike, rate, timeToExpiryYears, volatility, optionType);
    if (timeToExpiryYears <= 0 || volatility <= 0 || spot <= 0 || strike <= 0) {
      return { price, delta: 0, gamma: 0, vega: 0, theta: 0 };
    }

    const dd1 = d1(spot, strike, rate, timeToExpiryYears, volatility);
    const dd2 = d2(spot, strike, rate, timeToExpiryYears, volatility);
    const discount = Math.exp(-rate * timeToExpiryYears);
    const sqrtT = Math.sqrt(timeToExpiryYears);
    const pdf = normPdf(dd1);

    const delta = optionType === "call" ? normCdf(dd1) : normCdf(dd1) - 1;
    const gamma = pdf / (spot * volatility * sqrtT);
    const vega = (spot * pdf * sqrtT) / 100;

    const callTheta =
      (-spot * pdf * volatility / (2 * sqrtT) - rate * strike * discount * normCdf(dd2)) / 365;
    const putTheta =
      (-spot * pdf * volatility / (2 * sqrtT) + rate * strike * discount * normCdf(-dd2)) / 365;
    const theta = optionType === "call" ? callTheta : putTheta;

    return { price, delta, gamma, vega, theta };
  }

  impliedVolatility(
    marketPrice: number,
    spot: number,
    strike: number,
    rate: number,
    timeToExpiryYears: number,
    optionType: OptionRight
  ): number | null {
    if (marketPrice <= 0 || spot <= 0 || strike <= 0 || timeToExpiryYears <= 0) {
      return null;
    }

    let sigma = 0.25;
    for (let i = 0; i < 100; i += 1) {
      const greeks = this.greeks(spot, strike, rate, timeToExpiryYears, sigma, optionType);
      const diff = greeks.price - marketPrice;
      if (Math.abs(diff) < 1e-6) {
        return sigma;
      }
      if (Math.abs(greeks.vega) < 1e-8) {
        break;
      }
      sigma = clamp(sigma - diff / (greeks.vega * 100), 0.0001, 5);
    }
    return Number.isFinite(sigma) ? sigma : null;
  }
}

export const blackScholesModel = new BlackScholesModel();
