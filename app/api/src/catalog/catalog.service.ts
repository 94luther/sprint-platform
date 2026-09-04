import { Injectable } from '@nestjs/common';
import { MerchantsRepo } from '../data-store/repositories/merchants.repo';

@Injectable()
export class CatalogService {
  constructor(private readonly merchantsRepo: MerchantsRepo) {}

  getCatalog() {
    const merchants = this.merchantsRepo.listAll().map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      age_restricted: m.age_restricted,
      heroImage: m.heroImage,
      rating: m.rating,
      ratingCount: m.ratingCount,
      etaMinLow: m.etaMinLow,
      etaMinHigh: m.etaMinHigh,
      deliveryFee: m.deliveryFee,
      promo: m.promo,
      items: m.items.map((i) => ({
        id: i.id,
        name: i.name,
        price_bwp: i.price_bwp,
        photo: i.photo,
        description: i.description,
      })),
    }));
    return { merchants };
  }
}
