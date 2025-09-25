"use client";
import dynamic from "next/dynamic";
import React from "react";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div style={{ padding: "1rem" }}>
      <SwaggerUI
        url="/api/openapi"
        docExpansion="list"
        deepLinking
        defaultModelsExpandDepth={0}
        displayRequestDuration
        tryItOutEnabled
      />
    </div>
  );
}
