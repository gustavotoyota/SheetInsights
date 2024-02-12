'use client';

import { useEffect, useRef, useState } from 'react';

import type { Api } from '@/app-specific/api';
import { extractInsights } from '@/app-specific/extract-insights';
import { useAppIndexedDB } from '@/app-specific/use-app-indexeddb';
import ApiForm from '@/components/ApiForm';
import type { IQuery } from '@/components/Query';
import Query from '@/components/Query';
import { leanCloneThen } from '@/misc/lean-clone';
import { swap } from '@/misc/swap';

export default function Home() {
  const [sheetData, setSheetData] = useAppIndexedDB('sheetData', () => '');

  const [queries, setQueries] = useAppIndexedDB<IQuery[]>('queries', () => [
    {
      id: crypto.randomUUID(),
      title: '',
      expanded: true,
      enabled: true,
      value: '',
    },
  ]);
  const [result, setResult] = useState('');

  const [systemPrompt, setSystemPrompt] = useAppIndexedDB(
    'systemPrompt',
    () => 'You are a helpful AI assistant.',
  );

  const [apiIndex, setApiIndex] = useAppIndexedDB('apiIndex', () => 0);
  const [apis, setApis] = useAppIndexedDB<Api[]>('apis', () => [
    {
      name: 'OpenAI',
      url: 'https://api.openai.com/v1/chat/completions',
      key: '',
      models: [
        'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo-0301',
        'gpt-3.5-turbo-0613',
        'gpt-3.5-turbo-1106',
        'gpt-3.5-turbo-16k-0613',
        'gpt-3.5-turbo-16k',
        'gpt-3.5-turbo-instruct-0914',
        'gpt-3.5-turbo-instruct',
        'gpt-3.5-turbo',
        'gpt-4-0125-preview',
        'gpt-4-0613',
        'gpt-4-1106-preview',
        'gpt-4-turbo-preview',
        'gpt-4-vision-preview',
        'gpt-4',
      ],
      selectedModel: 'gpt-3.5-turbo',
    },
    {
      name: 'OctoAI',
      url: 'https://text.octoai.run/v1/chat/completions',
      key: '',
      models: [
        'codellama-7b-instruct-fp16',
        'codellama-13b-instruct-fp16',
        'codellama-34b-instruct-fp16',
        'codellama-70b-instruct-fp16',
        'llama-2-13b-chat-fp16',
        'llama-2-70b-chat-fp16',
        'llamaguard-7b-fp16',
        'mistral-7b-instruct-fp16',
        'mixtral-8x7b-instruct-fp16',
      ],
      selectedModel: 'mixtral-8x7b-instruct-fp16',
    },
  ]);

  const [progress, setProgress] = useState<string | null>(null);

  const resultRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (
      resultRef.current &&
      resultRef.current.scrollTop + resultRef.current.clientHeight ===
        resultRef.current.scrollHeight
    ) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  return (
    <main>
      <div className="container mx-auto">
        <div className="p-4 flex flex-col">
          <div>CSV data (with headers):</div>

          <textarea
            value={sheetData}
            onChange={(event) => setSheetData(event.target.value)}
            className="h-48 p-1 border border-black rounded-md resize-none bg-neutral-300"
          ></textarea>
        </div>

        <hr />

        <div className="p-4 flex flex-col">
          <div>
            Queries (use {'{{column}}'} to place column values):{' '}
            <button
              onClick={() => {
                setQueries(
                  leanCloneThen(queries, (queries) =>
                    queries.push({
                      id: crypto.randomUUID(),
                      title: '',
                      expanded: true,
                      enabled: true,
                      value: '',
                    }),
                  ),
                );
              }}
              className="p-1 border border-black rounded-md bg-neutral-300"
            >
              +
            </button>
          </div>

          {queries.map((query, index) => (
            <Query
              key={query.id}
              query={query}
              onQueryChange={(newQuery) =>
                setQueries(
                  leanCloneThen(
                    queries,
                    (queries) => (queries[index] = newQuery),
                  ),
                )
              }
              onMoveUp={() => {
                if (index === 0) {
                  return;
                }

                setQueries(
                  leanCloneThen(queries, (queries) =>
                    swap(queries, index, index - 1),
                  ),
                );
              }}
              onMoveDown={() => {
                if (index === queries.length - 1) {
                  return;
                }

                setQueries(
                  leanCloneThen(queries, (queries) =>
                    swap(queries, index, index + 1),
                  ),
                );
              }}
              onDelete={() => {
                if (queries.length === 1) {
                  return;
                }

                setQueries(
                  leanCloneThen(queries, (queries) => queries.splice(index, 1)),
                );
              }}
            />
          ))}

          <div className="h-4"></div>

          <div className="flex flex-col">
            <div>System prompt:</div>

            <textarea
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
              className="h-32 p-1 border border-black rounded-md resize-none bg-neutral-300"
            />
          </div>
        </div>

        <hr />

        <div className="p-4 flex flex-col">
          <ApiForm
            apis={apis}
            apiIndex={apiIndex}
            onApisChange={(newApis) => setApis(newApis)}
            onApiIndexChange={(newApiIndex) => setApiIndex(newApiIndex)}
          />
        </div>

        <hr />

        <div className="p-4 flex flex-col">
          <button
            className="p-2 bg-neutral-300 rounded-md"
            onClick={() =>
              extractInsights({
                csvData: sheetData,
                queries,
                systemPrompt,
                api: apis[apiIndex],

                onResultChange: (result) => setResult(result),
                onProgressUpdate: (progress) => setProgress(progress),
              })
            }
          >
            Extract insights
          </button>

          <div className="h-6"></div>

          <div>Result{progress ? ` (${progress})` : ''}:</div>

          <textarea
            ref={resultRef}
            readOnly
            value={result}
            className="h-48 p-1 border border-black rounded-md resize-none bg-neutral-300"
            placeholder="Insights go here."
          ></textarea>
        </div>
      </div>
    </main>
  );
}
