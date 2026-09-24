import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { DocumentModel } from "@/lib/pdf/documentModel";
import { formatCentsPdf } from "@/lib/money";
import {
  styles,
  DocumentHeader,
  CustomerVehicleSection,
  DescriptionSection,
  LaborTable,
  PartsTable,
  TotalsBox,
} from "@/lib/pdf/shared";

export function InvoiceDocument({ model }: { model: DocumentModel }) {
  return (
    <Document title={`Invoice - Work Order ${model.workOrderId}`}>
      <Page size="LETTER" style={styles.page}>
        <DocumentHeader model={model} title="INVOICE" />
        <CustomerVehicleSection model={model} />
        <DescriptionSection model={model} />
        <LaborTable model={model} />
        <PartsTable model={model} />
        <TotalsBox
          model={model}
          extraLine={{ label: "Balance Due", value: formatCentsPdf(model.grandTotalCents) }}
        />

        <View style={styles.section}>
          <Text style={styles.footerText}>Thank you for your business.</Text>
        </View>
      </Page>
    </Document>
  );
}
