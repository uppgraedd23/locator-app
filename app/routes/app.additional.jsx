import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(`#graphql
    query {
      locations(first: 100) {
        nodes {
          id
          name
          address {
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
    }
  `);
  const data = await response.json();
  return json({ locations: data.data.locations.nodes });
};

export default function AdditionalPage() {
  const { locations } = useLoaderData();
  return (
    <Page>
      <TitleBar title="Additional page" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <List>
                {locations.map((loc) => (
                  <List.Item key={loc.id}>
                    <div><b>ID:</b> {loc.id}</div>
                    <div><b>Name:</b> {loc.name}</div>
                    <div><b>Address1:</b> {loc.address.address1}</div>
                    <div><b>Address2:</b> {loc.address.address2}</div>
                    <div><b>City:</b> {loc.address.city}</div>
                    <div><b>Province:</b> {loc.address.province}</div>
                    <div><b>Country:</b> {loc.address.country}</div>
                    <div><b>Postal code:</b> {loc.address.zip}</div>
                    <div><b>Phone:</b> {loc.address.phone}</div>
                  </List.Item>
                ))}
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
        </Layout.Section>
      </Layout>
    </Page>
  );
}
