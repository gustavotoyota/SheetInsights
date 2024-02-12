import type { Api } from '@/app-specific/api';
import { leanCloneThen } from '@/misc/lean-clone';

export default function ApiForm(props: {
  apis: Api[];
  apiIndex: number;
  onApisChange: (newApis: Api[]) => void;
  onApiIndexChange: (newApiIndex: number) => void;
}) {
  return (
    <>
      <div className="flex flex-col">
        <div>API:</div>

        <select
          className="p-1 border border-black rounded-md bg-neutral-300"
          value={props.apiIndex}
          onChange={(event) =>
            props.onApiIndexChange(parseInt(event.target.value))
          }
        >
          {props.apis.map((api, index) => (
            <option
              key={index}
              value={index}
            >
              {api.name}
            </option>
          ))}
        </select>
      </div>

      <div className="h-2"></div>

      <div className="flex flex-col">
        <div>API URL:</div>

        <input
          type="text"
          value={props.apis[props.apiIndex].url}
          onChange={(event) => {
            props.onApisChange(
              leanCloneThen(
                props.apis,
                [props.apiIndex],
                (api) => (api.url = event.target.value),
              ),
            );
          }}
          className="p-1 border border-black rounded-md resize-none bg-neutral-300"
        />
      </div>

      <div className="h-2"></div>

      <div className="flex flex-col">
        <div>API key:</div>

        <input
          type="password"
          value={props.apis[props.apiIndex].key}
          onChange={(event) => {
            props.onApisChange(
              leanCloneThen(
                props.apis,
                [props.apiIndex],
                (api) => (api.key = event.target.value),
              ),
            );
          }}
          placeholder={`Generate your ${
            props.apis[props.apiIndex].name
          } API key and paste it here.`}
          className="p-1 border border-black rounded-md resize-none bg-neutral-300"
        />
      </div>

      <div className="h-2"></div>

      <div className="flex flex-col">
        <div>Model:</div>

        <select
          className="p-1 border border-black rounded-md bg-neutral-300"
          value={props.apis[props.apiIndex].selectedModel}
          onChange={(event) => {
            props.onApisChange(
              leanCloneThen(
                props.apis,
                [props.apiIndex],
                (api) => (api.selectedModel = event.target.value),
              ),
            );
          }}
        >
          {props.apis[props.apiIndex].models.map((model, index) => (
            <option
              key={index}
              value={model}
            >
              {model}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
