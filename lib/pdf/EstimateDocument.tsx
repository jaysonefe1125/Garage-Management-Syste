import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { DocumentModel } from "@/lib/pdf/documentModel";
import {
  styles,
  DocumentHeader,
  CustomerVehicleSection,
  DescriptionSection,
  LaborTable,
  PartsTable,
  TotalsBox,
} from "@/lib/pdf/shared";

const TERMS_TEXT =
  "This estimate is based on a visual inspection and known symptoms at the time of write-up. " +
  "Actual costs may vary if additional parts or labor are found to be necessary once work begins. " +
  "By signing below, the customer authorizes the shop to perform the described work.";

export function EstimateDocument({ model }: { model: DocumentModel }) {
  return (
    <Document title={`Estimate - Work Order ${model.workOrderId}`}>
      <Page size="LETTER" style={styles.page}>
        <DocumentHeader model={model} title="ESTIMATE" />
        <CustomerVehicleSection model={model} />
        <DescriptionSection model={model} />
        <LaborTable model={model} />
        <PartsTable model={model} />
        <TotalsBox model={model} />

        <View style={styles.section}>
          <Text style={styles.footerText}>{TERMS_TEXT}</Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLine}>Customer Signature / Date</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLine}>Shop Representative / Date</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
