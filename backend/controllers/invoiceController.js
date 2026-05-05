import mongoose from "mongoose";
import Invoice from "../models/invoiceModel.js";
import { getAuth } from "@clerk/express";

const API_BASE = 'http://localhost:4000';

function computeTotals(items=[], taxPercent=0){
    const safe = Array.isArray(items) ? items.filter(Boolean) : [];
    const subtotal = safe.reduce(
        (s, it)=>s+ (Number(it.qty || 0) * Number(it.unitPrice || 0))
    )
}