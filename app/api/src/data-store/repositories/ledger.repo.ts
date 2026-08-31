import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { StoreService } from '../store.service';
import { LedgerEntryRecord } from '../interfaces';
import { ILedgerRepo } from '../repo-interfaces';

// Writes the payout split for a delivered order as real double entry rows:
// every split (merchant_payable, courier_earnings, sprint_take) gets a debit
// against a clearing account and a matching credit against its own account,
// so the rows always balance in pairs.
@Injectable()
export class LedgerRepo implements ILedgerRepo {
  constructor(private readonly store: StoreService) {}

  writeOrderSplit(orderId: string, totalBwp: number): LedgerEntryRecord[] {
    const merchantAmt = Math.round(totalBwp * 0.75 * 100) / 100;
    const courierAmt = Math.round(totalBwp * 0.18 * 100) / 100;
    // Sprint's cut takes the remainder so the three splits always sum to
    // the exact order total, rounding included.
    const sprintAmt = Math.round((totalBwp - merchantAmt - courierAmt) * 100) / 100;

    const now = new Date().toISOString();
    const rows: LedgerEntryRecord[] = [];
    const pairs: [string, number][] = [
      ['merchant_payable', merchantAmt],
      ['courier_earnings', courierAmt],
      ['sprint_take', sprintAmt],
    ];

    for (const [account, amount] of pairs) {
      rows.push({
        id: crypto.randomUUID(),
        order_id: orderId,
        account: 'cash_clearing',
        type: 'debit',
        amount_bwp: amount,
        created_at: now,
      });
      rows.push({
        id: crypto.randomUUID(),
        order_id: orderId,
        account,
        type: 'credit',
        amount_bwp: amount,
        created_at: now,
      });
    }

    this.store.state.ledger_entries.push(...rows);
    this.store.persist();
    return rows;
  }
}
