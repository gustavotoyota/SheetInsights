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
      <div className="h-5"></div>

      <div className="text-center">
        <div className="text-white/60 text-xs">
          Developed by{' '}
          <a
            href="https://gustavotoyota.dev/"
            className="text-sky-400 hover:text-sky-300"
            target="_blank"
          >
            Gustavo Toyota
          </a>
        </div>
        <div className="text-white/60 text-xs">
          <a
            href="https://github.com/gustavotoyota/SheetInsights"
            className="text-sky-400 hover:text-sky-300"
            target="_blank"
          >
            https://github.com/gustavotoyota/SheetInsights
          </a>
        </div>
      </div>

      <div className="h-5"></div>

      <div className="px-7 container mx-auto flex flex-col lg:flex-row gap-7">
        <div className="flex-1">
          <div className="flex flex-col">
            <div>CSV data (with headers):</div>

            <div className="h-2"></div>

            <textarea
              value={sheetData}
              onChange={(event) => setSheetData(event.target.value)}
              className="h-48 px-2 py-[6px] bg-slate-800 text-slate-200 border border-slate-700 rounded-md outline-none resize-y"
            ></textarea>
          </div>

          <div className="h-6"></div>

          <div className="flex flex-col">
            <div>System prompt:</div>

            <div className="h-2"></div>

            <textarea
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
              className="h-48 px-2 py-[6px] bg-slate-800 text-slate-200 border border-slate-700 rounded-md outline-none resize-y"
            />
          </div>

          <div className="h-6"></div>

          <div className="flex flex-col">
            <div>
              Queries (use the syntax {'{{column-name}}'} to place column
              values):
              <div className="inline-block w-3"></div>
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
                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-50 rounded-md"
              >
                Add query
              </button>
            </div>

            <div className="h-3"></div>

            <div className="flex flex-col gap-3">
              {queries.map((query, index) => (
                <Query
                  key={query.id}
                  query={query}
                  queryIndex={index}
                  numQueries={queries.length}
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
                      leanCloneThen(queries, (queries) =>
                        queries.splice(index, 1),
                      ),
                    );
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex flex-col">
            <ApiForm
              apis={apis}
              apiIndex={apiIndex}
              onApisChange={(newApis) => setApis(newApis)}
              onApiIndexChange={(newApiIndex) => setApiIndex(newApiIndex)}
            />
          </div>

          <div className="h-5"></div>

          <div className="flex flex-col flex-1">
            <button
              className="p-2 bg-slate-600 hover:bg-slate-500 text-slate-50 rounded-md"
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

            <div>Results{progress ? ` (${progress})` : ''}:</div>

            <div className="h-2"></div>

            <textarea
              ref={resultRef}
              readOnly
              value={result}
              className="flex-1 min-h-80 px-2 py-[6px] bg-slate-800 text-slate-200 border border-slate-700 rounded-md outline-none resize-y"
              placeholder="Results go here."
            ></textarea>
          </div>
        </div>
      </div>

      <div className="h-24"></div>
    </main>
  );
}
