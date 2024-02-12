'use client';

import { memo } from 'react';

import { leanCloneThen } from '@/misc/lean-clone';

export interface IQuery {
  id: string;
  title: string;
  expanded: boolean;
  enabled: boolean;
  value: string;
}

const Query = memo(function Query(props: {
  query: IQuery;
  queryIndex: number;
  numQueries: number;
  onQueryChange: (newQuery: IQuery) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-3 flex flex-col bg-slate-900 rounded-md border border-slate-700">
      <div className="flex">
        <button
          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-50 rounded-md"
          onClick={() =>
            props.onQueryChange(
              leanCloneThen(
                props.query,
                (query) => (query.expanded = !query.expanded),
              ),
            )
          }
        >
          {props.query.expanded ? '⯆' : '⯈'}
        </button>

        <div className="w-3"></div>

        <input
          type="text"
          value={props.query.title}
          onChange={(event) =>
            props.onQueryChange(
              leanCloneThen(
                props.query,
                (query) => (query.title = event.target.value),
              ),
            )
          }
          className="flex-1 p-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md outline-none"
        />

        <div className="w-3"></div>

        <button
          onClick={() => props.onMoveUp()}
          className={`px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-50 rounded-md ${props.queryIndex === 0 ? 'opacity-70 pointer-events-none' : ''}`}
          disabled={props.queryIndex === 0}
        >
          ⮝
        </button>

        <div className="w-2"></div>

        <button
          onClick={() => props.onMoveDown()}
          className={`px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-50 rounded-md ${props.queryIndex === props.numQueries - 1 ? 'opacity-70 pointer-events-none' : ''}`}
          disabled={props.queryIndex === props.numQueries - 1}
        >
          ⮟
        </button>

        <div className="w-3"></div>

        <button
          onClick={() =>
            props.onQueryChange(
              leanCloneThen(
                props.query,
                (query) => (query.enabled = !query.enabled),
              ),
            )
          }
          className={`w-[84px] px-3 py-1 text-white/80 rounded-md ${props.query.enabled ? 'bg-blue-800 hover:bg-blue-700' : 'bg-red-900 hover:bg-red-800'}`}
        >
          {props.query.enabled ? 'Enabled' : 'Disabled'}
        </button>

        <div className="w-3"></div>

        <button
          onClick={() => props.onDelete()}
          className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded-md"
        >
          Delete
        </button>
      </div>

      {props.query.expanded && (
        <>
          <div className="h-3"></div>

          <textarea
            value={props.query.value}
            onChange={(event) =>
              props.onQueryChange(
                leanCloneThen(
                  props.query,
                  (query) => (query.value = event.target.value),
                ),
              )
            }
            className="h-48 px-2 py-[6px] bg-slate-800 text-slate-200 border border-slate-700 rounded-md outline-none resize-y"
          ></textarea>
        </>
      )}
    </div>
  );
});

export default Query;
