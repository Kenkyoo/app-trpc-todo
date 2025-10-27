import Link from "next/link";
import Head from "next/head";
import { InfoFooter } from "../components/footer";
import Header from "~/components/navbar";
import { useIsMutating } from "@tanstack/react-query";
import type { inferProcedureOutput } from "@trpc/server";
import clsx from "clsx";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import { useEffect, useRef, useState } from "react";
import type { AppRouter } from "../server/routers/_app";
import { ssgInit } from "../server/ssg-init";
import { trpc } from "../utils/trpc";
import { useClickOutside } from "../utils/use-click-outside";

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
      className="list-row items-center bg-accent p-1 my-2"
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
  /*
   * This data will be hydrated from the `prefetch` in `getStaticProps`. This means that the page
   * will be rendered with the data from the server and there'll be no client loading state 👍
   */
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
    <div data-theme="cupcake">
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
                className="card bg-base-100 w-96 shadow-sm"
              >
                <div className="card-body gap-10">
                  <h2 className="card-title mx-auto text-primary">
                    My grocery list
                  </h2>
                  <div>
                    <input
                      className="input"
                      placeholder="What needs to be done"
                      autoFocus
                      onKeyDown={(e) => {
                        const text = e.currentTarget.value.trim();
                        if (e.key === "Enter" && text) {
                          addTask.mutate({ text });
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>

                  <ul className="list bg-base-100 rounded-box shadow-md pb-20">
                    <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                      <label htmlFor="toggle-all" className="label">
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
                  <div className="card-actions flex justify-center gap-2 mt-5">
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

const filters = ["all", "active", "completed"] as const;
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = filters.map((filter) => ({
    params: { filter },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const ssg = await ssgInit(context);

  await ssg.todo.all.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
      filter: (context.params?.filter as string) ?? "all",
    },
    revalidate: 1,
  };
};
