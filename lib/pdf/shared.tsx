import { StyleSheet, View, Text, Image } from "@react-pdf/renderer";
import { formatCentsPdf } from "@/lib/money";
import type { DocumentModel } from "@/lib/pdf/documentModel";

export const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  logo: {
    width: 90,
    height: 45,
    objectFit: "contain",
    marginBottom: 6,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 700,
  },
  shopDetail: {
    fontSize: 9,
    color: "#4B5563",
  },
  docTitle: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "right",
  },
  docMeta: {
    fontSize: 9,
    color: "#4B5563",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
    color: "#374151",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoBlock: {
    width: "48%",
  },
  infoLine: {
    marginBottom: 2,
  },
  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  th: {
    padding: 6,
    fontWeight: 700,
    fontSize: 9,
    color: "#374151",
  },
  td: {
    padding: 6,
    fontSize: 9,
  },
  totalsBox: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    marginTop: 4,
    borderTopWidth: 1,
    borderColor: "#111827",
    fontWeight: 700,
  },
  footerText: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 24,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderColor: "#111827",
    marginTop: 24,
    paddingTop: 4,
    fontSize: 8,
    color: "#4B5563",
  },
});

export function DocumentHeader({
  model,
  title,
}: {
  model: DocumentModel;
  title: string;
}) {
  const addressParts = [
    model.shop.addressLine1,
    model.shop.addressLine2,
    [model.shop.city, model.shop.state, model.shop.zip].filter(Boolean).join(", "),
  ].filter(Boolean);

  return (
    <View style={styles.headerRow}>
      <View>
        {model.shop.logoUrl && (
          <Image src={model.shop.logoUrl} style={styles.logo} />
        )}
        <Text style={styles.businessName}>{model.shop.businessName}</Text>
        {addressParts.map((line, i) => (
          <Text key={i} style={styles.shopDetail}>
            {line}
          </Text>
        ))}
        {model.shop.phone && <Text style={styles.shopDetail}>{model.shop.phone}</Text>}
        {model.shop.email && <Text style={styles.shopDetail}>{model.shop.email}</Text>}
      </View>
      <View>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docMeta}>Work Order #{model.workOrderId}</Text>
        <Text style={styles.docMeta}>
          Date: {model.generatedAt.toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

export function CustomerVehicleSection({ model }: { model: DocumentModel }) {
  return (
    <View style={[styles.section, styles.infoGrid]}>
      <View style={styles.infoBlock}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.infoLine}>{model.customer.name}</Text>
        <Text style={styles.infoLine}>{model.customer.phone}</Text>
        {model.customer.email && (
          <Text style={styles.infoLine}>{model.customer.email}</Text>
        )}
        {model.customer.address && (
          <Text style={styles.infoLine}>{model.customer.address}</Text>
        )}
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.sectionTitle}>Vehicle</Text>
        <Text style={styles.infoLine}>{model.vehicle.label}</Text>
        {model.vehicle.vin && (
          <Text style={styles.infoLine}>VIN: {model.vehicle.vin}</Text>
        )}
        {model.vehicle.plate && (
          <Text style={styles.infoLine}>Plate: {model.vehicle.plate}</Text>
        )}
        {model.vehicle.mileage != null && (
          <Text style={styles.infoLine}>Mileage: {model.vehicle.mileage}</Text>
        )}
      </View>
    </View>
  );
}

export function DescriptionSection({ model }: { model: DocumentModel }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Description of Work</Text>
      <Text>{model.description}</Text>
    </View>
  );
}

export function LaborTable({ model }: { model: DocumentModel }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Labor</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.th, { width: "50%" }]}>Description</Text>
          <Text style={[styles.th, { width: "30%" }]}>Laborer</Text>
          <Text style={[styles.th, { width: "20%" }]}>Amount</Text>
        </View>
        {model.laborItems.map((item, i) => {
          const isLast = i === model.laborItems.length - 1;
          return (
            <View key={i} style={isLast ? styles.tableRowLast : styles.tableRow}>
              <Text style={[styles.td, { width: "50%" }]}>{item.description}</Text>
              <Text style={[styles.td, { width: "30%" }]}>{item.laborerName}</Text>
              <Text style={[styles.td, { width: "20%" }]}>
                {formatCentsPdf(item.totalCents)}
              </Text>
            </View>
          );
        })}
        {model.laborItems.length === 0 && (
          <View style={styles.tableRowLast}>
            <Text style={[styles.td, { width: "100%" }]}>No labor items.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function PartsTable({ model }: { model: DocumentModel }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Parts</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.th, { width: "52%" }]}>Description</Text>
          <Text style={[styles.th, { width: "13%" }]}>Qty</Text>
          <Text style={[styles.th, { width: "17%" }]}>Unit Price</Text>
          <Text style={[styles.th, { width: "18%" }]}>Total</Text>
        </View>
        {model.partItems.map((item, i) => {
          const isLast = i === model.partItems.length - 1;
          return (
            <View key={i} style={isLast ? styles.tableRowLast : styles.tableRow}>
              <Text style={[styles.td, { width: "52%" }]}>{item.description}</Text>
              <Text style={[styles.td, { width: "13%" }]}>{item.quantity}</Text>
              <Text style={[styles.td, { width: "17%" }]}>
                {formatCentsPdf(item.unitPriceCents)}
              </Text>
              <Text style={[styles.td, { width: "18%" }]}>
                {formatCentsPdf(item.totalCents)}
              </Text>
            </View>
          );
        })}
        {model.partItems.length === 0 && (
          <View style={styles.tableRowLast}>
            <Text style={[styles.td, { width: "100%" }]}>No parts used.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function TotalsBox({
  model,
  extraLine,
}: {
  model: DocumentModel;
  extraLine?: { label: string; value: string };
}) {
  return (
    <View style={styles.totalsBox}>
      <View style={styles.totalsRow}>
        <Text>Labor Total</Text>
        <Text>{formatCentsPdf(model.laborTotalCents)}</Text>
      </View>
      <View style={styles.totalsRow}>
        <Text>Parts Total</Text>
        <Text>{formatCentsPdf(model.partsTotalCents)}</Text>
      </View>
      <View style={styles.grandTotalRow}>
        <Text>Grand Total</Text>
        <Text>{formatCentsPdf(model.grandTotalCents)}</Text>
      </View>
      {extraLine && (
        <View style={[styles.totalsRow, { marginTop: 6 }]}>
          <Text style={{ fontWeight: 700 }}>{extraLine.label}</Text>
          <Text style={{ fontWeight: 700 }}>{extraLine.value}</Text>
        </View>
      )}
    </View>
  );
}
