// Format currency to PKR Rs.
export const formatPKR = (amount) => {
  const val = Number(amount || 0);
  return `Rs. ${val.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Format date string to friendly format
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format phone for WhatsApp link
export const formatWhatsAppPhone = (phone) => {
  if (!phone) return '';
  // Remove non-digit characters
  let clean = phone.replace(/\D/g, '');
  // Convert 03xx to 923xx
  if (clean.startsWith('03')) {
    clean = '92' + clean.substring(1);
  }
  return clean;
};

// Generate WhatsApp invoice message link
export const generateWhatsAppBillLink = (client, monthYear, summary) => {
  const phone = formatWhatsAppPhone(client.phone);
  if (!phone) return null;

  const text = `*WATER SUPPLY MANAGER - INVOICE* 💧\n` +
    `--------------------------------------\n` +
    `*Customer:* ${client.name}\n` +
    `*Month:* ${monthYear}\n\n` +
    `*Delivery Summary:*\n` +
    `• 19L Bottles: ${summary.total19l} @ Rs.${client.rate_19l}\n` +
    `• 6L Bottles: ${summary.total6l} @ Rs.${client.rate_6l}\n` +
    `• 1.5L Bottles: ${summary.total1_5l} @ Rs.${client.rate_1_5l}\n` +
    `• 500ml Bottles: ${summary.total500ml} @ Rs.${client.rate_500ml}\n\n` +
    `*Total Billed:* ${formatPKR(summary.totalBilled)}\n` +
    `*Payments Received:* ${formatPKR(summary.totalPaid)}\n` +
    `--------------------------------------\n` +
    `*BALANCE DUE:* ${formatPKR(summary.balance)}\n` +
    `*19L Empty Bottles Held:* ${summary.bottlesHeld} bottles\n\n` +
    `Thank you for your business! Please pay via Cash, JazzCash, or Easypaisa.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};
