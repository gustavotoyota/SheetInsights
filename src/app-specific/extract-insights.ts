import { IQuery } from "@/components/Query";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { Api } from "./api";

export function extractInsights(props: {
  csvData: string;
  queries: IQuery[];
  systemPrompt: string;
  api: Api;

  onResultChange: (result: string) => void;
  onProgressUpdate: (progress: string | null) => void;
}) {
  const rows: string[][] = [];

  let result = "";

  Readable.from(props.csvData)
    .pipe(csvParser())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      props.onResultChange(result);

      props.onProgressUpdate(`0/${rows.length}`);

      const lastEnabledQueryIdx = props.queries
        .map((query, index) => (query.enabled ? index : -1))
        .filter((index) => index !== -1)
        .at(-1);

      for (const [rowIdx, row] of Array.from(rows.entries())) {
        for (const [queryIdx, query] of Array.from(props.queries.entries())) {
          if (!query.enabled) {
            continue;
          }

          let finalQuery = query.value;

          for (const key in row) {
            finalQuery = finalQuery.replace(`{{${key}}}`, row[key]);
          }

          const response = await fetch(props.api.url, {
            headers: {
              Authorization: `Bearer ${props.api.key}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              model: props.api.selectedModel,

              messages: [
                {
                  role: "system",
                  content: props.systemPrompt,
                },
                {
                  role: "user",
                  content: finalQuery,
                },
              ],

              max_tokens: 128,
              presence_penalty: 0,
              temperature: 0.1,
              top_p: 0.9,
            }),
          });

          if (!response.ok) {
            throw new Error("HTTP error " + response.status);
          }

          const data = await response.json();

          result += `${data.choices[0].message.content
            .trim()
            .replaceAll('"', '""')}${
            queryIdx === lastEnabledQueryIdx ? "\n" : "\t"
          }`;

          props.onResultChange(result);
        }

        props.onProgressUpdate(`${rowIdx + 1}/${rows.length}`);
      }
    });
}
