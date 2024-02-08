"use client";

import Query from "@/components/Query";
import csvParser from "csv-parser";
import { useEffect, useRef, useState } from "react";
import { Readable } from "stream";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function useLocalStorage<T>(
  key: string,
  initialValue: () => T
): [T, (value: T | ((oldValue: T) => T)) => void] {
  const [value, setValue] = useState(() => {
    const item =
      typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;

    if (item) {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.error(error);
      }
    }

    return initialValue();
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export default function Home() {
  const [sheetData, setSheetData] = useState("");

  const [queries, setQueries] = useLocalStorage<string[]>("queries", () => [
    "",
  ]);
  const [result, setResult] = useState("");

  const [apiUrl, setApiUrl] = useLocalStorage("apiURL", () => "");
  const [apiToken, setApiToken] = useLocalStorage("apiToken", () => "");
  const [model, setModel] = useLocalStorage("model", () => "");
  const [systemPrompt, setSystemPrompt] = useLocalStorage(
    "systemPrompt",
    () => "You are a helpful AI assistant."
  );

  const [progress, setProgress] = useState<string | null>(null);

  const resultRef = useRef<HTMLTextAreaElement>(null);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (resultRef.current) {
        resultRef.current.scrollTop = resultRef.current.scrollHeight;
      }
    }
  });

  function processSheet() {
    const rows: any[] = [];

    Readable.from(sheetData)
      .pipe(csvParser())
      .on("data", (data) => rows.push(data))
      .on("end", async () => {
        setResult("");

        setProgress(`0/${rows.length}`);

        for (const [rowIdx, row] of Array.from(rows.entries())) {
          for (const [queryIdx, query] of Array.from(queries.entries())) {
            const startTime = Date.now();

            let finalQuery = query;

            for (const key in row) {
              finalQuery = finalQuery.replace(`{{${key}}}`, row[key]);
            }

            const response = await fetch(apiUrl, {
              headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify({
                model: model,

                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant. Keep your responses limited to one short paragraph if possible.",
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

            setResult(
              (result) =>
                `${result}"${data.choices[0].message.content
                  .trim()
                  .replaceAll('"', '""')}"${
                  queryIdx === queries.length - 1 ? "\n" : "\t"
                }`
            );

            // await sleep(Math.max(0, 500 - (Date.now() - startTime)));
          }

          setProgress(`${rowIdx + 1}/${rows.length}`);
        }
      });
  }

  return (
    <main>
      <div className="container mx-auto">
        <div className="p-4 flex flex-col">
          <div>CSV data with headers:</div>

          <textarea
            value={sheetData}
            onChange={(event) => setSheetData(event.target.value)}
            className="h-48 p-1 border border-black rounded-md resize-none bg-neutral-300"
          ></textarea>
        </div>

        <hr />

        <div className="p-4 flex flex-col">
          <div>
            Queries (use {"{{column}}"} to place column values):{" "}
            <button
              onClick={() => {
                setQueries((queries) => [...queries, ""]);
              }}
              className="p-1 border border-black rounded-md bg-neutral-300"
            >
              +
            </button>
          </div>

          {queries.map((query, index) => (
            <Query
              text={query}
              onChange={(text) => {
                const newQueries = [...queries];
                newQueries[index] = text;
                setQueries(newQueries);
              }}
              onDelete={() => {
                if (queries.length === 1) {
                  return;
                }

                const newQueries = [...queries];
                newQueries.splice(index, 1);
                setQueries(newQueries);
              }}
              key={index}
            />
          ))}
        </div>

        <hr />

        <div className="p-4 flex flex-col">
          <div>Result{progress ? ` (${progress})` : ""}:</div>

          <textarea
            ref={resultRef}
            readOnly
            value={result}
            className="h-48 p-1 border border-black rounded-md resize-none bg-neutral-300"
            placeholder="Process the sheet to see the result here."
          ></textarea>
        </div>

        <hr />

        <div className="p-4 flex flex-col">
          <div className="flex flex-col">
            <div>API URL:</div>

            <input
              type="text"
              value={apiUrl}
              onChange={(event) => setApiUrl(event.target.value)}
              className="p-1 border border-black rounded-md resize-none bg-neutral-300"
            />
          </div>

          <div className="h-2"></div>

          <div className="flex flex-col">
            <div>API token:</div>

            <input
              type="password"
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              className="p-1 border border-black rounded-md resize-none bg-neutral-300"
            />
          </div>

          <div className="h-2"></div>

          <div className="flex flex-col">
            <div>Model:</div>

            <input
              type="text"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="p-1 border border-black rounded-md resize-none bg-neutral-300"
            />
          </div>

          <div className="h-2"></div>

          <div className="flex flex-col">
            <div>System prompt:</div>

            <textarea
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
              className="h-32 p-1 border border-black rounded-md resize-none bg-neutral-300"
            />
          </div>

          <div className="h-6"></div>

          <button
            className="p-2 bg-neutral-300 rounded-md"
            onClick={processSheet}
          >
            Process sheet
          </button>
        </div>
      </div>
    </main>
  );
}