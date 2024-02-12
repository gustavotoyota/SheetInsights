"use client";

import { leanCloneThen } from "@/misc/lean-clone";
import { memo } from "react";

export interface IQuery {
  id: string;
  title: string;
  expanded: boolean;
  enabled: boolean;
  value: string;
}

const Query = memo(function Query(props: {
  query: IQuery;
  onQueryChange: (newQuery: IQuery) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <button
          className="p-1 border border-black rounded-md bg-neutral-300"
          onClick={() =>
            props.onQueryChange(
              leanCloneThen(
                props.query,
                (query) => (query.expanded = !query.expanded)
              )
            )
          }
        >
          {props.query.expanded ? "⯆" : "⯈"}
        </button>

        <div className="w-6"></div>

        <button
          onClick={() =>
            props.onQueryChange(
              leanCloneThen(
                props.query,
                (query) => (query.enabled = !query.enabled)
              )
            )
          }
          className="p-1 border border-black rounded-md bg-neutral-300"
        >
          {props.query.enabled ? "Enabled" : "Disabled"}
        </button>

        <div className="w-6"></div>

        <button
          onClick={() => props.onMoveUp()}
          className="p-1 border border-black rounded-md bg-neutral-300"
        >
          ⮝
        </button>

        <div className="w-2"></div>

        <button
          onClick={() => props.onMoveDown()}
          className="p-1 border border-black rounded-md bg-neutral-300"
        >
          ⮟
        </button>

        <div className="w-6"></div>

        <input
          type="text"
          value={props.query.title}
          onChange={(event) =>
            props.onQueryChange(
              leanCloneThen(
                props.query,
                (query) => (query.title = event.target.value)
              )
            )
          }
          className="p-1 border border-black rounded-md bg-neutral-300"
        />

        <div className="w-6 "></div>

        <button
          onClick={() => props.onDelete()}
          className="p-1 border border-black rounded-md bg-neutral-300"
        >
          Delete
        </button>
      </div>

      {props.query.expanded && (
        <textarea
          value={props.query.value}
          onChange={(event) =>
            props.onQueryChange(
              leanCloneThen(
                props.query,
                (query) => (query.value = event.target.value)
              )
            )
          }
          className="h-48 p-1 border border-black rounded-md resize-none bg-neutral-300"
        ></textarea>
      )}
    </div>
  );
});

export default Query;
