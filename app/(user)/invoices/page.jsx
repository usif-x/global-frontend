"use client";

import InvoiceService from "@/services/invoiceService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  PDF GENERATION HELPER (ADAPTED FOR YOUR DATA)
//=================================================================
/**
 * generateInvoicePDF
 *
 * Produces a professional, activity-themed invoice PDF for Hurghada Trips.
 * Layout: branded header → activity hero band → customer + invoice meta →
 * itemised pricing table → discount & fee summary → payment footer.
 */
const generateInvoicePDF = async (invoice, user) => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = autoTableModule.default || autoTableModule;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const callAutoTable = (options) => autoTable(doc, options);

    const W = doc.internal.pageSize.getWidth(); // 210
    const H = doc.internal.pageSize.getHeight(); // 297

    // ─── Palette ────────────────────────────────────────────────────────────
    const OCEAN = [14, 116, 144]; // cyan-700  — primary brand
    const DEEP = [15, 23, 42]; // slate-900 — heavy text
    const MID = [100, 116, 139]; // slate-500 — secondary text
    const LIGHT = [241, 245, 249]; // slate-100 — table stripe
    const WHITE = [255, 255, 255];
    const GREEN = [22, 163, 74]; // discount green
    const ORANGE = [234, 88, 12]; // fee orange
    const RED = [220, 38, 38];
    const GOLD = [202, 138, 4]; // pending amber

    // ─── Helpers ────────────────────────────────────────────────────────────
    const rgb = (c) => ({ red: c[0], green: c[1], blue: c[2] });
    const hex3 = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

    const setFill = (c) => doc.setFillColor(...c);
    const setStroke = (c) => doc.setDrawColor(...c);
    const setText = (c) => doc.setTextColor(...c);
    const setFont = (w, s = "normal") =>
      doc.setFont("helvetica", s === "bold" ? "bold" : "normal");

    const fmt = (amount, currency = invoice.currency) => {
      const code = currency || "EGP";
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: code,
          minimumFractionDigits: 2,
        }).format(amount || 0);
      } catch {
        return `${Number(amount || 0).toFixed(2)} ${code}`;
      }
    };

    const fmtDate = (ds) => {
      if (!ds) return "N/A";
      try {
        return new Date(ds).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return ds;
      }
    };

    const statusColor = (s) => {
      const map = {
        paid: GREEN,
        pending: GOLD,
        failed: RED,
        cancelled: MID,
        expired: ORANGE,
      };
      return map[(s || "").toLowerCase()] || MID;
    };

    // ─── Activity details from the structured array ─────────────────────────
    const detail = invoice.activity_details?.[0] || {};
    const pb = invoice.price_breakdown || null;
    const db = invoice.discount_breakdown || null;
    const actName = detail.name || invoice.activity || "Activity";
    const actDate = fmtDate(detail.activity_date);
    const guests =
      detail.adults !== undefined
        ? `${detail.adults} Adult${detail.adults !== 1 ? "s" : ""}${detail.children > 0 ? `, ${detail.children} Child${detail.children !== 1 ? "ren" : ""}` : ""}`
        : "";
    const hotel = detail.hotel_name
      ? `${detail.hotel_name}${detail.room_number ? ` — Room #${detail.room_number}` : ""}`
      : "";
    const requests = detail.special_requests || "None";

    // ════════════════════════════════════════════════════════════════════════
    // 1. HEADER — ocean band with company name + INVOICE title
    // ════════════════════════════════════════════════════════════════════════
    setFill(OCEAN);
    doc.rect(0, 0, W, 38, "F");

    // Wave-like accent strip
    setFill([8, 145, 178]); // cyan-600
    doc.rect(0, 30, W, 8, "F");

    // Company name
    setText(WHITE);
    doc.setFontSize(18);
    setFont("bold");
    doc.text("HURGHADA TRIPS", 14, 16);

    doc.setFontSize(8);
    setFont("normal");
    setText([186, 230, 253]); // cyan-200
    doc.text(
      "Sea Activities · Safari · Diving  |  hurghada-trips.online",
      14,
      22,
    );
    doc.text("Sunrise AQUAJOY, Hurghada, Egypt  ·  +20 107 044 0861", 14, 27);

    // INVOICE label — right side
    setText(WHITE);
    doc.setFontSize(26);
    setFont("bold");
    doc.text("INVOICE", W - 14, 20, { align: "right" });

    doc.setFontSize(8.5);
    setFont("normal");
    setText([186, 230, 253]);
    doc.text(`Ref: ${invoice.customer_reference || "—"}`, W - 14, 27, {
      align: "right",
    });
    doc.text(`Issued: ${fmtDate(invoice.created_at)}`, W - 14, 32, {
      align: "right",
    });

    let y = 46;

    // ════════════════════════════════════════════════════════════════════════
    // 2. ACTIVITY HERO BAND
    // ════════════════════════════════════════════════════════════════════════
    setFill(DEEP);
    doc.rect(0, y, W, 22, "F");

    // Activity icon stand-in — small compass/anchor symbol area
    setFill(OCEAN);
    doc.circle(22, y + 11, 7, "F");
    setText(WHITE);
    doc.setFontSize(10);
    setFont("bold");
    doc.text("⚓", 22, y + 14, { align: "center" }); // fallback text; will show as square in helvetica but gives layout structure

    setText(WHITE);
    doc.setFontSize(14);
    setFont("bold");
    doc.text(actName, 34, y + 8);

    doc.setFontSize(8);
    setFont("normal");
    setText([148, 163, 184]); // slate-400
    const heroMeta = [
      actDate ? `📅 ${actDate}` : null,
      guests ? `👥 ${guests}` : null,
      hotel ? `🏨 ${hotel}` : null,
    ]
      .filter(Boolean)
      .join("   ·   ");
    doc.text(heroMeta, 34, y + 15);

    // Status badge — far right of hero
    const sc = statusColor(invoice.status);
    setFill(sc);
    doc.roundedRect(W - 44, y + 5, 30, 10, 2, 2, "F");
    setText(WHITE);
    doc.setFontSize(8);
    setFont("bold");
    const statusLabel = (invoice.status || "PENDING").toUpperCase();
    doc.text(statusLabel, W - 29, y + 12, { align: "center" });

    y += 28;

    // ════════════════════════════════════════════════════════════════════════
    // 3. CUSTOMER & INVOICE META — two columns
    // ════════════════════════════════════════════════════════════════════════
    const col1 = 14;
    const col2 = W / 2 + 4;

    // Left — Billed To
    setText(OCEAN);
    doc.setFontSize(7.5);
    setFont("bold");
    doc.text("BILLED TO", col1, y);

    setText(DEEP);
    doc.setFontSize(9.5);
    setFont("bold");
    doc.text(invoice.buyer_name || "—", col1, y + 6);

    setFont("normal");
    setText(MID);
    doc.setFontSize(8.5);
    doc.text(invoice.buyer_email || "—", col1, y + 12);
    doc.text(invoice.buyer_phone || "—", col1, y + 17);

    // Right — Invoice Meta
    setText(OCEAN);
    doc.setFontSize(7.5);
    setFont("bold");
    doc.text("INVOICE DETAILS", col2, y);

    const metaRows = [
      [
        "Payment Type",
        invoice.invoice_type === "online" ? "Online Payment" : "Cash at Center",
      ],
      ["Payment Method", invoice.payment_method || "—"],
      ["Currency", invoice.currency || "EGP"],
      ["EasyKash Ref", invoice.easykash_reference || "—"],
    ];

    doc.setFontSize(8);
    metaRows.forEach(([label, val], i) => {
      setFont("normal");
      setText(MID);
      doc.text(label, col2, y + 6 + i * 5.5);
      setFont("bold");
      setText(DEEP);
      doc.text(String(val), col2 + 38, y + 6 + i * 5.5);
    });

    y += 30;

    // Thin rule
    setStroke([226, 232, 240]);
    doc.setLineWidth(0.3);
    doc.line(14, y, W - 14, y);
    y += 6;

    // ════════════════════════════════════════════════════════════════════════
    // 4. ITEMISED PRICING TABLE
    // ════════════════════════════════════════════════════════════════════════
    const tableRows = [];

    if (pb) {
      // Base price row
      tableRows.push([
        {
          content: "🏄 " + actName,
          styles: { fontStyle: "bold", textColor: rgb(DEEP) },
        },
        { content: "Base activity price", styles: { textColor: rgb(MID) } },
        {
          content: fmt(pb.base_price),
          styles: { halign: "right", fontStyle: "bold", textColor: rgb(DEEP) },
        },
      ]);

      // Mandatory fees
      (pb.mandatory_fees || []).forEach((fee) => {
        tableRows.push([
          { content: "➕ " + fee.name, styles: { textColor: rgb(ORANGE) } },
          { content: "Mandatory fee", styles: { textColor: rgb(MID) } },
          {
            content: "+ " + fmt(fee.amount),
            styles: { halign: "right", textColor: rgb(ORANGE) },
          },
        ]);
      });

      // Optional fees
      (pb.optional_fees || []).forEach((fee) => {
        tableRows.push([
          { content: "✅ " + fee.name, styles: { textColor: rgb(ORANGE) } },
          { content: "Optional add-on", styles: { textColor: rgb(MID) } },
          {
            content: "+ " + fmt(fee.amount),
            styles: { halign: "right", textColor: rgb(ORANGE) },
          },
        ]);
      });

      // Transfer fee
      if (pb.transfer_fee) {
        tableRows.push([
          {
            content: "🚐 Transfer / Pickup",
            styles: { textColor: rgb(OCEAN) },
          },
          {
            content: `Hotel pickup${detail.hotel_name ? ` (${detail.hotel_name})` : ""}`,
            styles: { textColor: rgb(MID) },
          },
          {
            content: "+ " + fmt(pb.transfer_fee.amount),
            styles: { halign: "right", textColor: rgb(OCEAN) },
          },
        ]);
      }

      // Discounts
      if (db?.group_discount) {
        tableRows.push([
          { content: "👥 Group Discount", styles: { textColor: rgb(GREEN) } },
          {
            content: `${db.group_discount.percentage}% — ${db.group_discount.applied_because || ""}`,
            styles: { textColor: rgb(MID) },
          },
          {
            content: "– " + fmt(db.group_discount.amount),
            styles: { halign: "right", textColor: rgb(GREEN) },
          },
        ]);
      }

      if (db?.promo_discount) {
        tableRows.push([
          { content: "🎟️ Promo Code", styles: { textColor: rgb(GREEN) } },
          {
            content: `${db.promo_discount.percentage}% — Code: ${db.promo_discount.code || ""}`,
            styles: { textColor: rgb(MID) },
          },
          {
            content: "– " + fmt(db.promo_discount.amount),
            styles: { halign: "right", textColor: rgb(GREEN) },
          },
        ]);
      }
    } else {
      // No fee breakdown — single row from invoice totals
      tableRows.push([
        {
          content: "🏄 " + actName,
          styles: { fontStyle: "bold", textColor: rgb(DEEP) },
        },
        {
          content:
            invoice.invoice_description?.split("\n")[0] || "Activity booking",
          styles: { textColor: rgb(MID) },
        },
        {
          content: fmt(invoice.amount),
          styles: { halign: "right", fontStyle: "bold", textColor: rgb(DEEP) },
        },
      ]);

      if (db?.group_discount) {
        tableRows.push([
          { content: "👥 Group Discount", styles: { textColor: rgb(GREEN) } },
          {
            content: `${db.group_discount.percentage}%`,
            styles: { textColor: rgb(MID) },
          },
          {
            content: "– " + fmt(db.group_discount.amount),
            styles: { halign: "right", textColor: rgb(GREEN) },
          },
        ]);
      }

      if (db?.promo_discount) {
        tableRows.push([
          { content: "🎟️ Promo Code", styles: { textColor: rgb(GREEN) } },
          {
            content: `Code: ${db.promo_discount.code || ""}`,
            styles: { textColor: rgb(MID) },
          },
          {
            content: "– " + fmt(db.promo_discount.amount),
            styles: { halign: "right", textColor: rgb(GREEN) },
          },
        ]);
      }
    }

    callAutoTable({
      head: [
        [
          { content: "ITEM", styles: { halign: "left" } },
          { content: "DESCRIPTION", styles: { halign: "left" } },
          { content: "AMOUNT", styles: { halign: "right" } },
        ],
      ],
      body: tableRows,
      startY: y,
      theme: "plain",
      headStyles: {
        fillColor: OCEAN,
        textColor: WHITE,
        fontSize: 7.5,
        fontStyle: "bold",
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 62 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 38, halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 4;

    // ════════════════════════════════════════════════════════════════════════
    // 5. TOTAL BOX — right-aligned summary
    // ════════════════════════════════════════════════════════════════════════
    const totalBoxX = W / 2;
    const totalBoxW = W / 2 - 14;

    // Subtotal / savings row
    if (db?.total_discount > 0) {
      setFill([240, 253, 244]); // green-50
      doc.rect(totalBoxX, y, totalBoxW, 9, "F");
      setText(GREEN);
      doc.setFontSize(8);
      setFont("normal");
      doc.text("Total Savings:", totalBoxX + 4, y + 6);
      setFont("bold");
      doc.text("– " + fmt(db.total_discount), W - 14, y + 6, {
        align: "right",
      });
      y += 10;
    }

    // Multi-currency EGP equivalent
    if (invoice.currency !== "EGP" && invoice.convert_rate) {
      const egpEq = invoice.amount * invoice.convert_rate;
      setFill(LIGHT);
      doc.rect(totalBoxX, y, totalBoxW, 9, "F");
      setText(MID);
      doc.setFontSize(7.5);
      setFont("normal");
      doc.text(
        `≈ EGP equivalent (rate: 1 ${invoice.currency} = ${invoice.convert_rate.toFixed(2)} EGP):`,
        totalBoxX + 4,
        y + 6,
      );
      setFont("bold");
      setText(DEEP);
      doc.text(fmt(egpEq, "EGP"), W - 14, y + 6, { align: "right" });
      y += 10;
    }

    // Grand total — ocean band
    setFill(OCEAN);
    doc.rect(totalBoxX, y, totalBoxW, 13, "F");
    setText(WHITE);
    doc.setFontSize(9);
    setFont("normal");
    doc.text("TOTAL DUE", totalBoxX + 4, y + 9);
    doc.setFontSize(13);
    setFont("bold");
    doc.text(fmt(invoice.amount), W - 14, y + 9, { align: "right" });
    y += 18;

    // ════════════════════════════════════════════════════════════════════════
    // 6. BOOKING DETAILS SECTION
    // ════════════════════════════════════════════════════════════════════════
    y += 4;
    setText(OCEAN);
    doc.setFontSize(7.5);
    setFont("bold");
    doc.text("BOOKING DETAILS", 14, y);

    y += 5;
    setFill(LIGHT);
    doc.rect(14, y, W - 28, guests || hotel ? 26 : 14, "F");

    const bookingRows = [
      guests ? ["Date", actDate] : null,
      guests ? ["Guests", guests] : null,
      hotel ? ["Hotel / Room", hotel] : null,
      requests !== "None" ? ["Special Requests", requests] : null,
    ].filter(Boolean);

    bookingRows.forEach(([label, val], i) => {
      const by = y + 5 + i * 6;
      setText(MID);
      doc.setFontSize(7.5);
      setFont("normal");
      doc.text(label + ":", 18, by);
      setText(DEEP);
      setFont("bold");
      doc.text(String(val), 58, by);
    });

    y += Math.max(bookingRows.length * 6 + 8, 16);

    // ════════════════════════════════════════════════════════════════════════
    // 7. PAYMENT ACTION AREA
    // ════════════════════════════════════════════════════════════════════════
    const status = (invoice.status || "").toLowerCase();

    if (
      status === "pending" &&
      invoice.invoice_type === "online" &&
      invoice.pay_url
    ) {
      y += 4;
      setFill([239, 246, 255]); // blue-50
      doc.rect(14, y, W - 28, 18, "F");
      setStroke(OCEAN);
      doc.setLineWidth(0.4);
      doc.rect(14, y, W - 28, 18, "S");

      setText(OCEAN);
      doc.setFontSize(8.5);
      setFont("bold");
      doc.text(
        "PAYMENT REQUIRED — Click the link below to pay securely online:",
        18,
        y + 7,
      );
      doc.setFontSize(8);
      setFont("normal");
      doc.setTextColor(37, 99, 235); // blue-600
      doc.textWithLink(invoice.pay_url, 18, y + 14, { url: invoice.pay_url });
      y += 22;
    }

    if (status === "pending" && invoice.invoice_type === "cash") {
      y += 4;
      setFill([240, 253, 244]);
      doc.rect(14, y, W - 28, 18, "F");
      setStroke(GREEN);
      doc.setLineWidth(0.4);
      doc.rect(14, y, W - 28, 18, "S");
      setText(GREEN);
      doc.setFontSize(8.5);
      setFont("bold");
      doc.text(
        "CASH PAYMENT — Please contact us to confirm, then pay at the diving center.",
        18,
        y + 7,
      );
      doc.setFontSize(8);
      setFont("normal");
      setText(MID);
      doc.text(
        `Amount to bring: ${fmt(invoice.amount)}  ·  Reference: ${invoice.customer_reference || "—"}`,
        18,
        y + 14,
      );
      y += 22;
    }

    if (status === "paid") {
      y += 4;
      setFill([240, 253, 244]);
      doc.rect(14, y, W - 28, 12, "F");
      setText(GREEN);
      doc.setFontSize(9);
      setFont("bold");
      doc.text(
        "✓  PAYMENT CONFIRMED — Thank you for booking with Hurghada Trips!",
        18,
        y + 8,
      );
      y += 16;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 8. FOOTER
    // ════════════════════════════════════════════════════════════════════════
    // Pin footer to bottom of page regardless of content length
    const footerY = H - 22;
    setFill(DEEP);
    doc.rect(0, footerY, W, 22, "F");

    setText([148, 163, 184]); // slate-400
    doc.setFontSize(7.5);
    setFont("normal");
    doc.text(
      "Hurghada Trips  ·  hurghada-trips.online  ·  +20 107 044 0861  ·  Sunrise AQUAJOY, Hurghada, Egypt",
      W / 2,
      footerY + 7,
      { align: "center" },
    );

    setText([100, 116, 139]);
    doc.setFontSize(7);
    doc.text(
      "This document was generated automatically. For questions contact us via WhatsApp or the website live chat.",
      W / 2,
      footerY + 13,
      { align: "center" },
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
      W / 2,
      footerY + 18,
      { align: "center" },
    );

    // ════════════════════════════════════════════════════════════════════════
    doc.save(
      `HurghadaTrips-Invoice-${invoice.customer_reference || "draft"}.pdf`,
    );
    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};

//=================================================================
//  HELPER & UI COMPONENTS
//=================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-20">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-slate-200"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
    </div>
  </div>
);
const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="p-4 space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50"
      >
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="h-4 bg-slate-200 rounded"
            style={{ width: `${(Math.random() * 20 + 80) / cols}%` }}
          ></div>
        ))}
      </div>
    ))}
  </div>
);
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const formatCurrency = (amount, currency = "EGP") => {
  const currencyCode = currency || "EGP";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${Number(amount).toFixed(2)} ${currencyCode}`;
  }
};
const StatusBadge = ({ status }) => {
  const safeStatus = (status || "pending").toLowerCase();
  const config = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "mdi:clock-outline",
    },
    paid: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "mdi:check-circle",
    },
    failed: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "mdi:close-circle",
    },
    cancelled: { bg: "bg-gray-100", text: "text-gray-800", icon: "mdi:cancel" },
    expired: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "mdi:timer-off",
    },
  }[safeStatus] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: "mdi:help-circle",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon icon={config.icon} className="w-3 h-3" />
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

const InfoBanner = ({ message }) => (
  <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg mb-8 flex items-start gap-4">
    <Icon
      icon="mdi:information-outline"
      className="w-6 h-6 flex-shrink-0 mt-0.5 text-blue-500"
    />
    <p className="text-sm">{message}</p>
  </div>
);

// --- NEW: structured booking details, replacing the raw <pre> dump of invoice_description ---
const BookingDetails = ({ invoice }) => {
  const details = invoice.activity_details?.[0];
  if (!details) {
    return (
      <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans bg-slate-50 p-3 rounded-md">
        {invoice.invoice_description}
      </pre>
    );
  }

  const rows = [
    { label: "Activity", value: details.name, icon: "mdi:airplane" },
    {
      label: "Date",
      value: details.activity_date
        ? new Date(details.activity_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
      icon: "mdi:calendar",
    },
    {
      label: "Guests",
      value: `${details.adults} Adult${details.adults > 1 ? "s" : ""}${
        details.children > 0
          ? `, ${details.children} Child${details.children > 1 ? "ren" : ""}`
          : ""
      }`,
      icon: "mdi:account-group",
    },
    {
      label: "Hotel",
      value:
        details.hotel_name || details.room_number
          ? `${details.hotel_name || "N/A"}${
              details.room_number ? `, Room #${details.room_number}` : ""
            }`
          : null,
      icon: "mdi:hotel",
    },
    {
      label: "Special Requests",
      value: details.special_requests || null,
      icon: "mdi:message-text-outline",
    },
  ].filter((r) => r.value);

  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start gap-2 text-sm">
          <Icon
            icon={row.icon}
            className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0"
          />
          <span className="text-slate-500 min-w-[110px]">{row.label}:</span>
          <span className="text-slate-800 font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  );
};

// --- NEW: renders the fees/transfer breakdown from invoice.price_breakdown ---
const PriceBreakdownSection = ({ invoice }) => {
  const pb = invoice.price_breakdown;
  if (!pb) return null;

  const hasFees =
    (pb.mandatory_fees && pb.mandatory_fees.length > 0) ||
    (pb.optional_fees && pb.optional_fees.length > 0) ||
    pb.transfer_fee;

  if (!hasFees) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
        Fees & Transfer ({invoice.currency})
      </h3>
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Base Price:</span>
          <span className="font-semibold text-slate-800">
            {invoice.currency} {pb.base_price?.toFixed(2)}
          </span>
        </div>

        {pb.mandatory_fees?.map((fee, i) => (
          <div key={`mandatory-${i}`} className="flex justify-between text-sm">
            <span className="text-slate-600 flex items-center gap-1">
              <Icon icon="mdi:cash-plus" className="w-4 h-4 text-orange-500" />
              {fee.name}
            </span>
            <span className="font-medium text-slate-800">
              + {invoice.currency} {fee.amount?.toFixed(2)}
            </span>
          </div>
        ))}

        {pb.optional_fees?.length > 0 && (
          <div className="bg-amber-100/50 border border-amber-200 rounded-md p-3 space-y-1">
            <p className="text-xs font-semibold text-amber-800 mb-1">
              Optional Add-ons Selected
            </p>
            {pb.optional_fees.map((fee, i) => (
              <div
                key={`optional-${i}`}
                className="flex justify-between text-sm"
              >
                <span className="text-amber-800">{fee.name}</span>
                <span className="font-medium text-amber-800">
                  + {invoice.currency} {fee.amount?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {pb.transfer_fee && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 flex items-center gap-1">
              <Icon icon="mdi:bus" className="w-4 h-4 text-cyan-600" />
              Transfer Fee (Zone #{pb.transfer_fee.zone_id})
            </span>
            <span className="font-medium text-slate-800">
              + {invoice.currency} {pb.transfer_fee.amount?.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-slate-600">Fees & Transfer Subtotal:</span>
          <span className="font-semibold text-orange-700">
            + {invoice.currency} {pb.addon_total?.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span className="text-slate-800">Final Price:</span>
          <span className="text-blue-600">
            {invoice.currency} {pb.final_price?.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

const InvoiceModal = ({ invoice, isOpen, onClose, onDownload }) => {
  if (!isOpen || !invoice) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-in fade-in-0 zoom-in-95">
          <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
            <h2 id="modal-title" className="text-2xl font-bold">
              Invoice Ref: {invoice.customer_reference}
            </h2>
            <p className="text-cyan-100 mt-1">
              Created on {formatDate(invoice.created_at)}
            </p>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">
                  Payment Type
                </p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      invoice.invoice_type === "online"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    <Icon
                      icon={
                        invoice.invoice_type === "online"
                          ? "mdi:credit-card"
                          : "mdi:cash"
                      }
                      className="w-4 h-4"
                    />
                    {invoice.invoice_type === "online"
                      ? "Online Payment"
                      : "Cash at Center"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
                {invoice.currency !== "EGP" && invoice.convert_rate && (
                  <div className="mt-1 text-sm text-slate-600">
                    <Icon
                      icon="mdi:information-outline"
                      className="inline w-4 h-4 mr-1"
                    />
                    ≈{" "}
                    {formatCurrency(
                      invoice.amount * invoice.convert_rate,
                      "EGP",
                    )}
                    <div className="text-xs text-slate-500 mt-0.5">
                      Rate: 1 {invoice.currency} ={" "}
                      {invoice.convert_rate.toFixed(2)} EGP
                    </div>
                  </div>
                )}
                <p className="text-sm font-medium text-slate-500 mt-2">
                  Pay Currency
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {invoice.currency}
                </p>
              </div>
            </div>

            {/* --- REPLACED: structured booking details instead of raw description --- */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                Booking Details
              </h3>
              <BookingDetails invoice={invoice} />
            </div>

            {/* Discount Breakdown */}
            {invoice.discount_breakdown && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                  Discount Breakdown ({invoice.currency})
                </h3>
                {invoice.currency !== "EGP" && invoice.convert_rate && (
                  <div className="mb-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <div className="flex items-start gap-2">
                      <Icon
                        icon="mdi:information-outline"
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Multi-Currency Invoice</p>
                        <p className="mt-1">
                          Prices below are in {invoice.currency}. EGP
                          equivalent:{" "}
                          <strong>
                            {formatCurrency(
                              invoice.amount * invoice.convert_rate,
                              "EGP",
                            )}
                          </strong>{" "}
                          (Rate: 1 {invoice.currency} ={" "}
                          {invoice.convert_rate.toFixed(2)} EGP)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Base Price:</span>
                    <span className="font-semibold text-slate-800">
                      {invoice.currency}{" "}
                      {invoice.discount_breakdown.base_price?.toFixed(2) ??
                        invoice.amount?.toFixed(2)}
                    </span>
                  </div>

                  {invoice.discount_breakdown.group_discount && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-700 font-medium">
                          <Icon
                            icon="mdi:account-group"
                            className="w-4 h-4 inline mr-1"
                          />
                          Group Discount (
                          {invoice.discount_breakdown.group_discount.percentage}
                          %)
                        </span>
                        <span className="font-bold text-green-700">
                          - {invoice.currency}{" "}
                          {invoice.discount_breakdown.group_discount.amount?.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-green-600">
                        {
                          invoice.discount_breakdown.group_discount
                            .applied_because
                        }
                      </p>
                    </div>
                  )}

                  {invoice.discount_breakdown.promo_discount && (
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-purple-700 font-medium">
                          <Icon
                            icon="mdi:ticket-percent"
                            className="w-4 h-4 inline mr-1"
                          />
                          Promo Code (
                          {invoice.discount_breakdown.promo_discount.percentage}
                          %)
                        </span>
                        <span className="font-bold text-purple-700">
                          - {invoice.currency}{" "}
                          {invoice.discount_breakdown.promo_discount.amount?.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 font-mono">
                        Code: {invoice.discount_breakdown.promo_discount.code}
                      </p>
                    </div>
                  )}

                  {invoice.discount_breakdown.total_discount > 0 && (
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-green-600 font-semibold">
                        <Icon
                          icon="mdi:piggy-bank"
                          className="w-4 h-4 inline mr-1"
                        />
                        Total Savings:
                      </span>
                      <span className="font-bold text-green-600">
                        {invoice.currency}{" "}
                        {invoice.discount_breakdown.total_discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg border-t pt-3">
                    <span className="text-slate-800">
                      {invoice.price_breakdown
                        ? "Price Before Fees:"
                        : "Final Amount:"}
                    </span>
                    <span className="text-blue-600">
                      {invoice.currency}{" "}
                      {(
                        invoice.discount_breakdown.final_price ?? invoice.amount
                      )?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* --- NEW: Fees & Transfer breakdown (only renders if price_breakdown is present) --- */}
            <PriceBreakdownSection invoice={invoice} />

            <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3">
              {invoice.status.toLowerCase() === "pending" && (
                <>
                  {invoice.invoice_type === "online" && invoice.pay_url ? (
                    <a
                      href={invoice.pay_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2"
                    >
                      <Icon icon="mdi:credit-card" className="w-5 h-5" />
                      <span>Pay Online Now</span>
                    </a>
                  ) : invoice.invoice_type === "cash" ? (
                    <div className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2">
                      <Icon icon="mdi:cash" className="w-5 h-5" />
                      <span>Pay at Diving Center</span>
                    </div>
                  ) : null}
                </>
              )}
              <a
                href={`/invoices/${invoice.id}`}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2"
              >
                <Icon icon="mdi:file-document-outline" className="w-5 h-5" />
                <span>View Invoice Page</span>
              </a>
              <button
                onClick={() => onDownload(invoice)}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2"
              >
                <Icon icon="mdi:file-pdf-box" className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//=================================================================
//  MAIN "MY INVOICES" PAGE COMPONENT
//=================================================================
export default function MyInvoicesPage() {
  const [allInvoices, setAllInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState("all");

  const { isAuthenticated, user } = useAuthStore();

  const summaryByCurrency = useMemo(() => {
    const currencies = {};
    allInvoices.forEach((invoice) => {
      const curr = invoice.currency;
      if (!currencies[curr]) {
        currencies[curr] = {
          paid: 0,
          pending: 0,
          failed: 0,
          total: 0,
          paid_count: 0,
          pending_count: 0,
          failed_count: 0,
          total_count: 0,
        };
      }
      const status = invoice.status.toLowerCase();
      if (status === "paid") {
        currencies[curr].paid += invoice.amount;
        currencies[curr].paid_count += 1;
      } else if (status === "pending") {
        currencies[curr].pending += invoice.amount;
        currencies[curr].pending_count += 1;
      } else if (
        status === "failed" ||
        status === "cancelled" ||
        status === "expired"
      ) {
        currencies[curr].failed += invoice.amount;
        currencies[curr].failed_count += 1;
      }
      currencies[curr].total += invoice.amount;
      currencies[curr].total_count += 1;
    });
    return currencies;
  }, [allInvoices]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {
        const invoiceData = await InvoiceService.getMyInvoices();
        setAllInvoices(invoiceData || []);
      } catch (err) {
        setError("Could not load your invoices. Please try again later.");
        toast.error(err.response?.data?.detail || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    let invoicesToProcess = [...allInvoices];
    if (statusFilter !== "all") {
      invoicesToProcess = invoicesToProcess.filter(
        (invoice) => invoice.status.toLowerCase() === statusFilter,
      );
    }
    setFilteredInvoices(invoicesToProcess);
    setCurrentPage(1);
  }, [allInvoices, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handleDownloadPDF = async (invoice) => {
    if (!invoice || !user) return toast.error("Missing data to generate PDF.");
    const toastId = toast.loading("Generating your PDF...");
    try {
      await generateInvoicePDF(invoice, user);
      toast.update(toastId, {
        render: "PDF downloaded!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (e) {
      toast.update(toastId, {
        render: "Could not generate PDF.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "customer_reference",
        header: "Reference",
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            {row.original.customer_reference}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {formatDate(row.original.created_at)}
          </div>
        ),
      },
      {
        accessorKey: "activity",
        header: "Activity",
        cell: ({ row }) => (
          <div className="font-medium text-slate-700">
            {row.original.activity_details
              .map((activity) => activity.name)
              .join(", ")}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-slate-800">
              {formatCurrency(row.original.amount, row.original.currency)}
            </span>
            {/* NEW: small indicator when the amount includes extra fees */}
            {row.original.price_breakdown?.addon_total > 0 && (
              <div className="text-xs text-orange-600 mt-0.5">
                incl. +
                {formatCurrency(
                  row.original.price_breakdown.addon_total,
                  row.original.currency,
                )}{" "}
                fees
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "currency",
        header: "Pay Currency",
        cell: ({ row }) => (
          <div className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">
            {row.original.currency || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "invoice_type",
        header: "Payment Type",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              row.original.invoice_type === "online"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            <Icon
              icon={
                row.original.invoice_type === "online"
                  ? "mdi:credit-card"
                  : "mdi:cash"
              }
              className="w-3 h-3"
            />
            {row.original.invoice_type === "online" ? "Online" : "Cash"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedInvoice(row.original)}
              className="p-2 text-slate-500 rounded-full hover:bg-blue-100 hover:text-blue-600"
              title="View Details"
            >
              <Icon icon="mdi:eye-outline" width={18} />
            </button>
            <a
              href={`/invoices/${row.original.id}`}
              className="p-2 text-slate-500 rounded-full hover:bg-purple-100 hover:text-purple-600"
              title="Go to Invoice Page"
            >
              <Icon icon="mdi:file-document-outline" width={18} />
            </a>
            {row.original.status.toLowerCase() === "pending" && (
              <>
                {row.original.invoice_type === "online" &&
                row.original.pay_url ? (
                  <a
                    href={row.original.pay_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 rounded-full hover:bg-green-100 hover:text-green-600"
                    title="Pay Online"
                  >
                    <Icon icon="mdi:credit-card" width={18} />
                  </a>
                ) : row.original.invoice_type === "cash" ? (
                  <div
                    className="p-2 text-green-600 rounded-full bg-green-50"
                    title="Pay at Diving Center"
                  >
                    <Icon icon="mdi:cash" width={18} />
                  </div>
                ) : null}
              </>
            )}
            <button
              onClick={() => handleDownloadPDF(row.original)}
              className="p-2 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600"
              title="Download PDF"
            >
              <Icon icon="mdi:file-pdf-box" width={18} />
            </button>
          </div>
        ),
      },
    ],
    [user],
  );

  const table = useReactTable({
    data: paginatedInvoices,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: false,
  });

  const currencyNote =
    "Please note: Summary totals are shown in their original booking currencies for accuracy. When you proceed to payment for a pending invoice, you will be charged in the currency you originally selected during booking. The payment provider will handle the final conversion.";

  const actionRequiredInvoices = useMemo(() => {
    return allInvoices.filter(
      (inv) =>
        inv.picked_up === false &&
        !inv.is_confirmed &&
        (inv.status.toLowerCase() === "paid" ||
          (inv.status.toLowerCase() === "pending" &&
            inv.invoice_type === "cash")),
    );
  }, [allInvoices]);

  const confirmedWaitingInvoices = useMemo(() => {
    return allInvoices.filter(
      (inv) =>
        inv.picked_up === false &&
        inv.is_confirmed === true &&
        (inv.status.toLowerCase() === "paid" ||
          (inv.status.toLowerCase() === "pending" &&
            inv.invoice_type === "cash")),
    );
  }, [allInvoices]);

  return (
    <div className=" min-h-screen pt-20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 mb-8">
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:receipt-text-outline" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                My Invoices
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Review your transaction history and manage payments.
              </p>
            </div>
          </div>
        </div>

        {actionRequiredInvoices.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <Icon
                icon="mdi:information"
                className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-3">
                  Action Required: Confirm Your Trip
                  {actionRequiredInvoices.length > 1 ? "s" : ""}
                </h3>

                {actionRequiredInvoices.some(
                  (inv) => inv.invoice_type === "cash",
                ) ? (
                  <div className="text-blue-800 mb-4">
                    <p className="font-semibold mb-3">
                      You have {actionRequiredInvoices.length} invoice
                      {actionRequiredInvoices.length > 1 ? "s" : ""} that
                      require
                      {actionRequiredInvoices.length === 1 ? "s" : ""} your
                      attention:
                    </p>
                    <div className="bg-white/60 rounded-lg p-4 mb-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                            1
                          </div>
                          <div>
                            <p className="font-bold text-blue-900">
                              FIRST: Confirm Your Activity Details
                            </p>
                            <p className="text-sm mt-1">
                              Contact us to confirm your trip details and
                              provide any additional important information.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                            2
                          </div>
                          <div>
                            <p className="font-bold text-blue-900">
                              SECOND: Pay Using Cash
                            </p>
                            <p className="text-sm mt-1">
                              For cash invoices, pay at the diving center when
                              you arrive.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-blue-800 mb-4">
                    You have {actionRequiredInvoices.length} paid invoice
                    {actionRequiredInvoices.length > 1 ? "s" : ""} that need
                    {actionRequiredInvoices.length === 1 ? "s" : ""}{" "}
                    confirmation. Please contact us to finalize your trip
                    details and provide any additional important information.
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {actionRequiredInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-white/60 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-blue-900">
                          Invoice:{" "}
                        </span>
                        <a
                          href={`/invoices/${inv.id}`}
                          className="font-mono text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          {inv.customer_reference}
                        </a>
                        <span className="text-slate-600 ml-3">
                          {inv.activity_details
                            .map((activity) => activity.name)
                            .join(", ")}
                        </span>
                        <span
                          className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            inv.invoice_type === "online"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          <Icon
                            icon={
                              inv.invoice_type === "online"
                                ? "mdi:credit-card"
                                : "mdi:cash"
                            }
                            className="w-3 h-3"
                          />
                          {inv.invoice_type === "online" ? "Online" : "Cash"}
                        </span>
                      </div>
                      {inv.status.toLowerCase() === "paid" ? (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <Icon icon="mdi:check-circle" className="w-4 h-4" />
                          Paid
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-semibold flex items-center gap-1">
                          <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://api.whatsapp.com/send?phone=201070440861&text=Hello! I need to confirm my trip details"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold shadow-md hover:shadow-lg"
                  >
                    <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                    <span>WhatsApp Us</span>
                  </a>
                  <button
                    onClick={() => {
                      if (window.$crisp) {
                        window.$crisp.push(["do", "chat:open"]);
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-cyan-600 text-white px-4 py-2.5 rounded-lg hover:bg-cyan-700 transition-colors text-sm font-semibold shadow-md hover:shadow-lg"
                  >
                    <Icon icon="mdi:message-text" className="w-5 h-5" />
                    <span>Live Chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmedWaitingInvoices.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-xl mb-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <Icon
                icon="mdi:check-circle"
                className="w-8 h-8 text-green-600 flex-shrink-0 mt-1"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-3">
                  Your Booking is Confirmed!
                </h3>

                {confirmedWaitingInvoices.map((inv) => (
                  <div key={inv.id} className="mb-4 last:mb-0">
                    <p className="text-green-800 font-medium text-lg">
                      Please wait at{" "}
                      {inv.activity_details?.[0]?.hotel_name || "(your hotel)"}{" "}
                      reception at 8 AM.
                    </p>
                    <div className="mt-2 text-sm text-green-700 bg-white/60 p-3 rounded-lg inline-block">
                      <span className="font-semibold">Invoice Ref:</span>{" "}
                      {inv.customer_reference} |
                      <span className="font-semibold ml-2">Activity:</span>{" "}
                      {inv.activity}
                    </div>
                  </div>
                ))}

                <div className="mt-4 text-green-800/80 text-sm">
                  We look forward to seeing you! If you have any questions, feel
                  free to contact us below.
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <a
                    href="https://api.whatsapp.com/send?phone=201070440861"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    <Icon icon="mdi:whatsapp" className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {Object.keys(summaryByCurrency).length > 0 && !loading && (
          <div className="mb-6">
            {Object.entries(summaryByCurrency).map(([currency, data]) => (
              <div key={currency} className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Summary for {currency}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg border p-6">
                    <p className="text-slate-500 text-sm font-medium">
                      Total Paid
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(data.paid, currency)}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {data.paid_count || 0} Paid Invoices
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border p-6">
                    <p className="text-slate-500 text-sm font-medium">
                      Pending Amount
                    </p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                      {formatCurrency(data.pending, currency)}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {data.pending_count || 0} Pending Invoices
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border p-6">
                    <p className="text-slate-500 text-sm font-medium">
                      Failed/Cancelled
                    </p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(data.failed, currency)}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {data.failed_count || 0} Failed Invoices
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border p-6">
                    <p className="text-slate-500 text-sm font-medium">
                      Total Invoices
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {data.total_count || 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Across all statuses
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600">
                  Filter by status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="p-12 text-center text-red-600">{error}</div>
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:file-search-outline"
                    className="w-10 h-10 text-cyan-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Invoices Found
                </h3>
                <p className="text-slate-500">
                  You don't have any invoices matching this filter.
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-slate-50/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer select-none"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-cyan-50/30">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredInvoices.length > 0 && totalPages > 1 && (
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Page <strong>{currentPage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <InvoiceModal
        isOpen={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
}
