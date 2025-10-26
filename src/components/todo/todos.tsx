import { useIsMutating } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";
import { trpc } from "~/utils/trpc";
import ListItem from "~/components/todo/listItems";
import type { InferGetStaticPropsType } from "next";
import { getStaticProps } from "~/lib/getStaticProps";
import filters from "~/lib/filters";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

export default function Todos(props: PageProps) {
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
      await utils.todo.all.cancel();
      const tasks = allTasks.data ?? [];

      // Optimistic update: include a provisional userId (reuse an existing one if available)
      utils.todo.all.setData(undefined, [
        ...tasks,
        {
          id: `${Math.random()}`, // temporal
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

  const toggleAll = {
    mutate: async ({ completed }: { completed: boolean }) => {
      await utils.todo.all.cancel();
      const tasks = allTasks.data ?? [];
      utils.todo.all.setData(
        undefined,
        tasks.map((t) => ({
          ...t,
          completed,
        }))
      );
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
    <>
      <div className="flex flex-col justify-center items-center">
        <header>
<h1 className="mb-5 text-5xl font-bold">Grocery App</h1> 
</header>
<div data-theme="cupcake" className="card bg-base-100 w-96 shadow-sm">
  <div className="card-body gap-10">
  <h2 className="card-title mx-auto text-primary">My grocery list</h2>
  <div >
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
              toggleAll.mutate({ completed: e.currentTarget.checked });
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
    <div className="stat-title">{tasksLeft == 1 ? "task left" : "tasks left"}</div>
    <div className="stat-value text-primary">{tasksLeft} </div>
  </div>
</div>
          <div className="filter">
            {filters.map((filter) => (               
             <Link
                  href={"/" + filter}
                  className={filter == props.filter ? "selected" : ""}
                >
              <input key={"filter-" + filter} className="btn bg-accent" type="radio" name="filters" aria-label={filter[0].toUpperCase() + filter.slice(1)}
                
              />
            </Link>
            ))}
          {tasksCompleted > 0 && (
            <input className="btn btn-square" type="reset" value="×"
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
  </>
  );
}
