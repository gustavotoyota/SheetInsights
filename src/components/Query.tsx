"use client";

import { memo } from "react";

export interface IQuery {
  id: string;
  title: string;
  expanded: boolean;
  enabled: boolean;
  value: string;
}

const Query = memo(function Query(props: {
  title: string;
  expanded: boolean;
  enabled: boolean;
  value: string;
  onTitleChange: (title: string) => void;
  onValueChange: (text: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleExpanded: (expanded: boolean) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <button
          className="p-1 border border-black rounded-md bg-neutral-300"
          onClick={() => props.onToggleExpanded(!props.expanded)}
        >
          {props.expanded ? "⯆" : "⯈"}
        </button>

        <div className="w-6"></div>

        <button
          onClick={() => props.onToggleEnabled(!props.enabled)}
          className="p-1 border border-black rounded-md bg-neutral-300"
        >
          {props.enabled ? "Enabled" : "Disabled"}
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
          value={props.title}
          onChange={(event) => props.onTitleChange(event.target.value)}
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

      {props.expanded && (
        <textarea
          value={props.value}
          onChange={(event) => props.onValueChange(event.target.value)}
          className="h-48 p-1 border border-black rounded-md resize-none bg-neutral-300"
        ></textarea>
      )}
    </div>
  );
});

export default Query;
