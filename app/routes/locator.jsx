
import { useLoaderData } from "@remix-run/react";
import Map from "../components/Map.jsx";
import prisma from "../db.server";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { ClientOnly } from "remix-utils/client-only"

import { useEffect, useRef } from "react";
import { json } from "@remix-run/node";

export async function loader({ request }) {
  const locations = await prisma.store.findMany();

  return json({ locations });
}

export default function Locator() {
  const { locations } = useLoaderData();

  return (
    <div >
      <h1>Google Map123</h1>

      <ul>
        {locations.map((loc) => (
          <li key={loc.id}>{loc.storeName}</li>
        ))}
      </ul>
      <ClientOnly>
        {() => {
          <Map locations={locations} />
        }
        }
      </ClientOnly>
    </div>
  );
}
