"use client";

import { memo } from "react";

const Query = memo(function Query(props: {
  text: string;
  onChange: (text: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div>
        <button
          onClick={() => props.onDelete()}
          className="p-1 border border-black rounded-md bg-neutral-300"
        >
          -
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
