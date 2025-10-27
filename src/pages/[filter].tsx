import Link from "next/link";
import Head from "next/head";
import { InfoFooter } from "../components/footer";
import Header from "~/components/navbar";
import { useIsMutating } from "@tanstack/react-query";
import type { inferProcedureOutput } from "@trpc/server";
import clsx from "clsx";
import type { InferGetStaticPropsType } from "next";
import { useEffect, useRef, useState } from "react";
import type { AppRouter } from "../server/routers/_app";
import { trpc } from "../utils/trpc";
import { useClickOutside } from "../utils/use-click-outside";
import { getStaticProps } from "~/lib/getStaticProps";
import groceries from "~/lib/groceries";
import filters from "~/lib/filters";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

type Task = inferProcedureOutput<AppRouter["todo"]["all"]>[number];

function ListItem(props: { task: Task }) {
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
      className="list-row items-center bg-secondary py-1 px-2 my-2"
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
            className={clsx("label text-white text-xs font-bold", {
              hidden: editing,
            })}
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
      <input
        className="btn btn-square"
        type="reset"
        value="×"
        onClick={() => {
          deleteTask.mutate(task.id);
        }}
      />
    </li>
  );
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

export default function TodosPage(props: PageProps) {
  const [query, setQuery] = useState("");

  const filtered =
    query === ""
      ? groceries
      : groceries.filter((g) => g.toLowerCase().includes(query.toLowerCase()));

  const allTasks = trpc.todo.all.useQuery(undefined, {
    staleTime: 3000,
  });

  const utils = trpc.useUtils();
  const addTask = trpc.todo.add.useMutation({
    async onMutate({ text }) {
      /**
       * Optimistically update the data
       * with the newly added task
       */
      await utils.todo.all.cancel();
      const tasks = allTasks.data ?? [];
      utils.todo.all.setData(undefined, [
        ...tasks,
        {
          id: `${Math.random()}`,
          completed: false,
          text,
          createdAt: new Date(),
          userId: tasks[0]?.userId ?? "",
        },
      ]);
    },
  });

  const clearCompleted = trpc.todo.clearCompleted.useMutation({
    async onMutate() {
      await utils.todo.all.cancel();
      const tasks = allTasks.data ?? [];
      utils.todo.all.setData(
        undefined,
        tasks.filter((t) => !t.completed)
      );
    },
  });

  const editTaskForAll = trpc.todo.edit.useMutation();
  const toggleAll = {
    mutate: ({ completed }: { completed: boolean }) => {
      const tasks = allTasks.data ?? [];
      // optimistically update the cache
      utils.todo.all.setData(
        undefined,
        tasks.map((t) => ({
          ...t,
          completed,
        }))
      );
      // persist each change
      for (const t of tasks) {
        editTaskForAll.mutate({ id: t.id, data: { completed } });
      }
    },
  };

  const number = useIsMutating();
  useEffect(() => {
    // invalidate queries when mutations have settled
    // doing this here rather than in `onSettled()`
    // to avoid race conditions if you're clicking fast
    if (number === 0) {
      void utils.todo.all.invalidate();
    }
  }, [number, utils]);

  const tasksLeft = allTasks.data?.filter((t) => !t.completed).length ?? 0;
  const tasksCompleted = allTasks.data?.filter((t) => t.completed).length ?? 0;

  return (
    <div data-theme="cupcake" className="font-display">
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage:
            "url(https://plus.unsplash.com/premium_photo-1700028097417-419b240a5cc7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870)",
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-md">
            <div className="flex flex-col justify-center items-center">
              <header>
                <h1 className="mb-5 text-5xl font-bold">Grocery App</h1>
                <p className="mb-5">
                  Todo grocery tasks with autocomplete list and auth for saving
                  your tasks
                </p>
              </header>
              <div
                data-theme="cupcake"
                className="card bg-base-300 w-96 shadow-lg"
              >
                <div className="card-body gap-10">
                  <h2 className="card-title mx-auto text-primary text-2xl font-bold">
                    My grocery list
                  </h2>
                  <div>
                    <Combobox
                      value={query}
                      onChange={(val) => {
                        if (val && val.trim() !== "") {
                          addTask.mutate({ text: val });
                        }
                        setQuery("");
                      }}
                    >
                      <ComboboxInput
                        placeholder="What needs to be done"
                        className="input"
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          const text = e.currentTarget.value.trim();
                          if (e.key === "Enter" && text) {
                            addTask.mutate({ text });
                            setQuery("");
                          }
                        }}
                      />
                      <ComboboxOptions
                        anchor="bottom"
                        className="border mt-1 rounded bg-white"
                      >
                        {filtered.map((item) => (
                          <ComboboxOption
                            key={item}
                            value={item}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {item}
                          </ComboboxOption>
                        ))}
                      </ComboboxOptions>
                    </Combobox>
                  </div>

                  <ul className="list bg-base-300 rounded-box shadow-md pb-20 px-4">
                    <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                      <label
                        htmlFor="toggle-all"
                        className="label font-semibold"
                      >
                        <input
                          id="toggle-all"
                          className="checkbox"
                          type="checkbox"
                          checked={tasksCompleted === allTasks.data?.length}
                          onChange={(e) => {
                            toggleAll.mutate({
                              completed: e.currentTarget.checked,
                            });
                          }}
                        />
                        Mark all as complete
                      </label>
                    </li>
                    {allTasks.data
                      ?.filter(({ completed }) =>
                        props.filter === "completed"
                          ? completed
                          : props.filter === "active"
                          ? !completed
                          : true
                      )
                      .map((task) => (
                        <ListItem key={task.id} task={task} />
                      ))}
                  </ul>
                  <div className="card-actions flex justify-center gap-4 mt-5">
                    <div className="stats shadow">
                      <div className="stat">
                        <div className="stat-title">
                          {tasksLeft == 1 ? "task left" : "tasks left"}
                        </div>
                        <div className="stat-value text-primary">
                          {tasksLeft}{" "}
                        </div>
                      </div>
                    </div>
                    <div className="filter">
                      {filters.map((filter) => (
                        <Link
                          href={"/" + filter}
                          className={filter == props.filter ? "selected" : ""}
                        >
                          <input
                            key={"filter-" + filter}
                            className="btn bg-accent"
                            type="radio"
                            name="filters"
                            aria-label={
                              filter[0].toUpperCase() + filter.slice(1)
                            }
                          />
                        </Link>
                      ))}
                      {tasksCompleted > 0 && (
                        <input
                          className="btn btn-square"
                          type="reset"
                          value="×"
                          onClick={() => {
                            clearCompleted.mutate();
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InfoFooter filter={props.filter} />
    </div>
  );
}
