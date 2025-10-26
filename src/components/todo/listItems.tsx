import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "~/utils/use-click-outside";
import type { AppRouter } from "~/server/routers/_app";
import type { inferProcedureOutput } from "@trpc/server";
import clsx from "clsx";
import { trpc } from "~/utils/trpc";

type Task = inferProcedureOutput<AppRouter["todo"]["all"]>[number];

export default function ListItem(props: { task: Task }) {
  const { task } = props;

  const [editing, setEditing] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const [text, setText] = useState(task.text);

  useEffect(() => {
    setText(task.text);
  }, [task.text]);

  const editTask = trpc.todo.edit.useMutation({
    async onMutate({ id, data }) {
      await utils.todo.all.cancel();
      const allTasks = utils.todo.all.getData();
      if (!allTasks) {
        return;
      }
      utils.todo.all.setData(
        undefined,
        allTasks.map((t) =>
          t.id === id
            ? {
                ...t,
                ...data,
              }
            : t
        )
      );
    },
  });
  const deleteTask = trpc.todo.delete.useMutation({
    async onMutate() {
      await utils.todo.all.cancel();
      const allTasks = utils.todo.all.getData();
      if (!allTasks) {
        return;
      }
      utils.todo.all.setData(
        undefined,
        allTasks.filter((t) => t.id != task.id)
      );
    },
  });

  useClickOutside({
    ref: wrapperRef,
    enabled: editing,
    callback() {
      editTask.mutate({
        id: task.id,
        data: { text },
      });
      setEditing(false);
    },
  });

  return (
    <li
      key={task.id}
      className="list-row items-center bg-accent"
      ref={wrapperRef}
    >
      <div>
                    <input
          className="checkbox"
          type="checkbox"
          checked={task.completed}
          onChange={(e) => {
            const checked = e.currentTarget.checked;
            editTask.mutate({
              id: task.id,
              data: { completed: checked },
            });
          }}
          autoFocus={editing}
        />
        </div>
        <div className="list-col-grow">
        <div>      
        <label
          className={clsx("label", { hidden: editing })}
          onDoubleClick={(e) => {
            setEditing(true);
            e.currentTarget.focus();
          }}
        >
          {text}
        </label>
      </div>
      <div>
          <input
        className={clsx("input", { hidden: !editing })}
        value={text}
        ref={inputRef}
        onChange={(e) => {
          const newText = e.currentTarget.value;
          setText(newText);
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            editTask.mutate({
              id: task.id,
              data: { text },
            });
            setEditing(false);
          }
        }}
      /> 
    </div>
  </div>
  <input className="btn btn-square" type="reset" value="×" onClick={() => {
            deleteTask.mutate(task.id);
          }} 
  />
    </li>
  );
}
