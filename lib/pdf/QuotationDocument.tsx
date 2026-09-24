import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { formatCentsPdf } from "@/lib/money";
import { styles } from "@/lib/pdf/shared";
import type { QuotationDocumentModel } from "@/lib/pdf/quotationDocumentModel";

const TERMS_TEXT =
  "This is a quotation only and does not constitute a binding order. Prices are estimates " +
  "based on the information provided and may change once the vehicle is inspected. Valid " +
  "for 7 days from the date issued.";

export function QuotationDocument({ model }: { model: QuotationDocumentModel }) {
  const addressParts = [
    model.shop.addressLine1,
    model.shop.addressLine2,
    [model.shop.city, model.shop.state, model.shop.zip].filter(Boolean).join(", "),
  ].filter(Boolean);

  return (
    <Document title={`Quotation ${model.quotationId}`}>
      <Page size="LETTER" style={styles.page}>
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
            <Text style={styles.docTitle}>QUOTATION</Text>
            <Text style={styles.docMeta}>Quotation #{model.quotationId}</Text>
            <Text style={styles.docMeta}>
              Date: {model.generatedAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={{ marginBottom: 2 }}>{model.client.name}</Text>
          {model.client.contact && <Text>{model.client.contact}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle</Text>
          <Text>{model.vehicleDescription}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request</Text>
          <Text>{model.requestDescription}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Labor</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { width: "70%" }]}>Description</Text>
              <Text style={[styles.th, { width: "30%" }]}>Amount</Text>
            </View>
            {model.laborItems.map((item, i) => {
              const isLast = i === model.laborItems.length - 1;
              return (
                <View key={i} style={isLast ? styles.tableRowLast : styles.tableRow}>
                  <Text style={[styles.td, { width: "70%" }]}>{item.description}</Text>
                  <Text style={[styles.td, { width: "30%" }]}>
                    {formatCentsPdf(item.amountCents)}
                  </Text>
                </View>
              );
            })}
            {model.laborItems.length === 0 && (
              <View style={styles.tableRowLast}>
                <Text style={[styles.td, { width: "100%" }]}>No labor lines.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parts (estimated, subject to availability)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { width: "52%" }]}>Description</Text>
              <Text style={[styles.th, { width: "13%" }]}>Qty</Text>
              <Text style={[styles.th, { width: "17%" }]}>Est. Price</Text>
              <Text style={[styles.th, { width: "18%" }]}>Total</Text>
            </View>
            {model.partItems.map((item, i) => {
              const isLast = i === model.partItems.length - 1;
              return (
                <View key={i} style={isLast ? styles.tableRowLast : styles.tableRow}>
                  <Text style={[styles.td, { width: "52%" }]}>{item.description}</Text>
                  <Text style={[styles.td, { width: "13%" }]}>{item.quantity}</Text>
                  <Text style={[styles.td, { width: "17%" }]}>
                    {formatCentsPdf(item.estimatedPriceCents)}
                  </Text>
                  <Text style={[styles.td, { width: "18%" }]}>
                    {formatCentsPdf(item.totalCents)}
                  </Text>
                </View>
              );
            })}
            {model.partItems.length === 0 && (
              <View style={styles.tableRowLast}>
                <Text style={[styles.td, { width: "100%" }]}>No parts listed.</Text>
              </View>
            )}
          </View>
        </View>

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
            <Text>Estimated Total</Text>
            <Text>{formatCentsPdf(model.grandTotalCents)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.footerText}>{TERMS_TEXT}</Text>
        </View>
      </Page>
    </Document>
  );
}
