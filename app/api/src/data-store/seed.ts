import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import { encrypt, blindIndex } from '../common/aes';
import { WAYPOINTS } from '../common/waypoints';
import { StoreShape, UserRecord, MerchantRecord, CourierRecord } from './interfaces';

// Builds the fresh demo dataset described in the Sprint alpha contract:
// 3 demo login users, 3 merchants with realistic Pula pricing, and 5 named
// couriers wandering around Gaborone. Called once, the first time the API
// boots and data/store.json does not exist yet.
export function buildSeed(): StoreShape {
  const merchants: MerchantRecord[] = [
    {
      id: 'm1',
      name: "Mama T's Kitchen",
      type: 'food',
      age_restricted: false,
      lat: WAYPOINTS[1].lat + 0.002,
      lng: WAYPOINTS[1].lng - 0.001,
      items: [
        { id: 'm1-i1', name: 'Seswaa and Pap', price_bwp: 55 },
        { id: 'm1-i2', name: 'Chicken and Rice', price_bwp: 45 },
        { id: 'm1-i3', name: 'Beef Stew Plate', price_bwp: 50 },
        { id: 'm1-i4', name: 'Vegetable Relish Plate', price_bwp: 35 },
        { id: 'm1-i5', name: 'Grilled Chicken Quarter', price_bwp: 40 },
        { id: 'm1-i6', name: 'Bogobe with Sour Milk', price_bwp: 30 },
      ],
    },
    {
      id: 'm2',
      name: 'QuickMart Broadhurst',
      type: 'grocery',
      age_restricted: false,
      lat: WAYPOINTS[2].lat - 0.003,
      lng: WAYPOINTS[2].lng + 0.002,
      items: [
        { id: 'm2-i1', name: 'White Bread 700g', price_bwp: 14 },
        { id: 'm2-i2', name: 'Fresh Milk 1L', price_bwp: 18 },
        { id: 'm2-i3', name: 'Eggs Tray of 30', price_bwp: 55 },
        { id: 'm2-i4', name: 'White Sugar 2kg', price_bwp: 32 },
        { id: 'm2-i5', name: 'Cooking Oil 750ml', price_bwp: 28 },
        { id: 'm2-i6', name: 'Maize Meal 10kg', price_bwp: 95 },
      ],
    },
    {
      id: 'm3',
      name: 'CloudNine Vapes',
      type: 'vape',
      age_restricted: true,
      lat: WAYPOINTS[0].lat + 0.0015,
      lng: WAYPOINTS[0].lng + 0.0025,
      items: [
        { id: 'm3-i1', name: 'Disposable Vape 2500 Puffs', price_bwp: 180 },
        { id: 'm3-i2', name: 'Disposable Vape 5000 Puffs', price_bwp: 250 },
        { id: 'm3-i3', name: 'Vape Juice 30ml', price_bwp: 120 },
        { id: 'm3-i4', name: 'Replacement Coils 5 Pack', price_bwp: 90 },
        { id: 'm3-i5', name: 'Starter Kit', price_bwp: 350 },
      ],
    },
  ];

  const courierNames = ['Kabelo', 'Tumi', 'Ofentse', 'Naledi', 'Thato'];
  const couriers: CourierRecord[] = courierNames.map((name, i) => {
    const wp = WAYPOINTS[i % WAYPOINTS.length];
    return {
      id: `c${i + 1}`,
      name,
      status: 'online',
      lat: wp.lat,
      lng: wp.lng,
      rating: Math.round((4.5 + Math.random() * 0.45) * 10) / 10,
      earnings_today_bwp: Math.round(Math.random() * 120),
      waypoint_target: (i + 1) % WAYPOINTS.length,
      move_target: null,
    };
  });

  function makeUser(name: string, role: 'customer' | 'courier' | 'ops', phone: string, courierId?: string): UserRecord {
    return {
      id: crypto.randomUUID(),
      name,
      role,
      phone_hash: blindIndex(phone),
      phone_enc: encrypt(phone),
      pin_hash: bcrypt.hashSync('1234', 10),
      courier_id: courierId,
    };
  }

  const users: UserRecord[] = [
    makeUser('Neo', 'customer', '71111111'),
    makeUser('Kabelo', 'courier', '72222222', 'c1'),
    makeUser('Amo', 'ops', '73333333'),
  ];

  return {
    users,
    merchants,
    couriers,
    orders: [],
    ledger_entries: [],
    events_outbox: [],
    idempotency: [],
    last_dispatch: null,
  };
}
