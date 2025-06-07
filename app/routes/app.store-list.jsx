import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormLayout,
  Layout,
  List,
  Modal,
  Page,
  TextField,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData, useNavigation, Form as RemixForm } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

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
  const shopifyLocations = data.data.locations.nodes;

  const existingStores = await prisma.store.findMany();
  const existingStoreMap = new Map(existingStores.map(store => [store.admin_graphql_api_id, store]));

  const locationsToKeepInDb = new Set();

  for (const loc of shopifyLocations) {
    const existingStore = existingStoreMap.get(loc.id);

    if (existingStore) {
      await prisma.store.update({
        where: { id: existingStore.id },
        data: {
          name: loc.name,
          url: `/admin/locations/${loc.id}`,
          address1: loc.address.address1,
          address2: loc.address.address2,
          city: loc.address.city,
          province: loc.address.province,
          country: loc.address.country,
          zip: loc.address.zip,
          phone: loc.address.phone,
          admin_graphql_api_id: loc.id,
          active: true,
        },
      });
      locationsToKeepInDb.add(loc.id);
    } else {
      await prisma.store.create({
        data: {
          name: loc.name,
          url: `/admin/locations/${loc.id}`,
          address1: loc.address.address1,
          address2: loc.address.address2,
          city: loc.address.city,
          province: loc.address.province,
          country: loc.address.country,
          zip: loc.address.zip,
          phone: loc.address.phone,
          admin_graphql_api_id: loc.id,
          active: true,
        },
      });
      locationsToKeepInDb.add(loc.id);
    }
  }

  for (const existingStore of existingStores) {
    if (!locationsToKeepInDb.has(existingStore.admin_graphql_api_id)) {
      await prisma.store.delete({
        where: { id: existingStore.id },
      });
    }
  }

  const allStoresInDb = await prisma.store.findMany();
  return json({ stores: allStoresInDb });
};

export const action = async ({ request }) => {
  console.log("Action function hit!");
  const formData = await request.formData();
  const id = formData.get("id");
  const openingHours = formData.get("openingHours");
  const closingHours = formData.get("closingHours");
  const freeParking = formData.get("freeParking") === "on";
  const storeName = formData.get("storeName");

  console.log({ id, openingHours, closingHours, freeParking, storeName });

  if (!id) {
    console.error("ID is required for update.");
    return json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await prisma.store.update({
      where: { id: Number(id) },
      data: {
        openingHours,
        closingHours,
        freeParking,
        storeName,
      },
    });
    console.log(`Store ${id} updated successfully.`);
    return redirect("/app/store-list");
  } catch (error) {
    console.error(`Error updating store ${id}:`, error);
    return json({ error: "Failed to update store.", details: error.message }, { status: 500 });
  }
};

export default function StoreList() {
  const { stores } = useLoaderData();
  const navigation = useNavigation();

  const [active, setActive] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [modalOpeningHours, setModalOpeningHours] = useState("");
  const [modalClosingHours, setModalClosingHours] = useState("");
  const [modalFreeParking, setModalFreeParking] = useState(false);
  const [modalStoreName, setModalStoreName] = useState("");

  const openModal = (store) => {
    setCurrentStore(store);
    setModalOpeningHours(store.openingHours || "");
    setModalClosingHours(store.closingHours || "");
    setModalFreeParking(Boolean(store.freeParking));
    setModalStoreName(store.storeName || "");
    setActive(true);
  };

  const closeModal = () => {
    setActive(false);
    setCurrentStore(null);
  };

  const isSubmitting = navigation.state === "submitting";

  return (
    <Page>
      <TitleBar title="Store List" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="300">
            <List>
              {stores.map((store) => (
                <List.Item key={store.id}>
                  <Card sectioned>
                    <Box>
                      <div><b>ID:</b> {store.id}</div>
                      <div><b>Name:</b> {store.name}</div>
                      <div><b>URL:</b> {store.url}</div>
                      <div><b>Address1:</b> {store.address1}</div>
                      <div><b>Address2:</b> {store.address2}</div>
                      <div><b>City:</b> {store.city}</div>
                      <div><b>Province:</b> {store.province}</div>
                      <div><b>Country:</b> {store.country}</div>
                      <div><b>Country Code:</b> {store.country_code}</div>
                      <div><b>Country Name:</b> {store.country_name}</div>
                      <div><b>Postal code:</b> {store.zip}</div>
                      <div><b>Phone:</b> {store.phone}</div>
                      <div><b>Active:</b> {store.active ? "Yes" : "No"}</div>
                      <div><b>Legacy:</b> {store.legacy ? "Yes" : "No"}</div>
                      <div><b>Admin GraphQL API ID:</b> {store.admin_graphql_api_id}</div>
                      <div><b>Opening Hours:</b> {store.openingHours || "-"}</div>
                      <div><b>Closing Hours:</b> {store.closingHours || "-"}</div>
                      <div><b>Free Parking:</b> {store.freeParking ? "Yes" : "No"}</div>
                      <div><b>Store Name:</b> {store.storeName || "-"}</div>
                    </Box>
                    <Box>
                      <Button onClick={() => openModal(store)}>Edit</Button>
                    </Box>
                  </Card>
                </List.Item>
              ))}
            </List>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <Modal
        open={active}
        onClose={closeModal}
        title={`Edit Store: ${currentStore?.name || ""}`}
        primaryAction={{
          content: isSubmitting ? "Saving..." : "Save",
          loading: isSubmitting,
          disabled: isSubmitting,
          onAction: () => {
            const form = document.getElementById("edit-store-form");
            if (form) {
              form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
            }
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: closeModal,
          },
        ]}
      >
        {currentStore && (
          <Modal.Section>
            <RemixForm method="post" id="edit-store-form">
              <input type="hidden" name="id" value={currentStore.id} />
              <FormLayout>
                <TextField
                  label="Opening Hours"
                  name="openingHours"
                  value={modalOpeningHours}
                  onChange={(value) => setModalOpeningHours(value)}
                  autoComplete="off"
                />
                <TextField
                  label="Closing Hours"
                  name="closingHours"
                  value={modalClosingHours}
                  onChange={(value) => setModalClosingHours(value)}
                  autoComplete="off"
                />
                <Checkbox
                  label="Free Parking"
                  name="freeParking"
                  checked={modalFreeParking}
                  onChange={(checked) => setModalFreeParking(checked)}
                />
                <TextField
                  label="Store Name"
                  name="storeName"
                  value={modalStoreName}
                  onChange={(value) => setModalStoreName(value)}
                  autoComplete="off"
                />
              </FormLayout>
            </RemixForm>
          </Modal.Section>
        )}
      </Modal>
    </Page>
  );
}