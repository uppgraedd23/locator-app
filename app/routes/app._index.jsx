import { useEffect } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import Map from "../components/Map";
import prisma from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const locations = await prisma.store.findMany();

  return json({ locations });
};

export default function Index() {
  const { locations } = useLoaderData();

  return (
    <Page>
      <TitleBar title="Locator app"></TitleBar>

      <Map locations={locations} />
    </Page>
  );
}
