import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { createWeight, getWeightListItems } from "~/models/weight.server";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import FileDropTarget from "~/components/DropTarget.client";
import csvToJson from "csvtojson";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ClientOnly } from "remix-utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const weightListItems = await getWeightListItems({ userId });
  return json({ weightListItems });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const text = formData.get("text");

  await csvToJson()
    .fromString(text?.toString() || "")
    .then((json) => {
      json.map(async (record) => {
        const weight = {
          amount: record.amount,
          date: new Date(record.date),
          userId,
        };
        await createWeight(weight);
      });
    });

  return redirect("/weights");
}

export default function WeightIndexPage() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  function handleUploadedData(text: string) {
    if (!text) return;
    submit({ text }, { method: "post" });
  }

  return (
    <>
      <div className="h-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data.weightListItems}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dates" />
            <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Form method="post">
        <div className="flex h-1/2 w-1/2">
          <ClientOnly>
            {() => (
              <FileDropTarget
                onUpload={(text: string) => handleUploadedData(text)}
              />
            )}
          </ClientOnly>
        </div>
      </Form>
    </>
  );
}
