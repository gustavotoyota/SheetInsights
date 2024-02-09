"use client";

import { memo } from "react";

export interface IQuery {
  id: string;
  enabled: boolean;
  value: string;
}

const Query = memo(function Query(props: {
  enabled: boolean;
  text: string;
  onChange: (text: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <button
          onClick={() => props.onDelete()}
          className="p-1 border border-black rounded-md bg-neutral-300"
        >
          -
        </button>

        <div className="w-2"></div>

        <button
          onClick={() => props.onToggleEnabled(!props.enabled)}
          className="p-1 border border-black rounded-md bg-neutral-300"
        >
          {props.enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      <textarea
        value={props.text}
        onChange={(event) => props.onChange(event.target.value)}
        className="h-48 p-1 border border-black rounded-md resize-none bg-neutral-300"
      ></textarea>
    </div>
  );
});

export default Query;
