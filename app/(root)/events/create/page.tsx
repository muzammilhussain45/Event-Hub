import EventForm from "@/components/shared/EventForm";
import { getCurrentUserId } from "@/lib/current-user";
import { redirect } from "next/navigation";

const CreateEvent = async () => {
  const userId = await getCurrentUserId();

  if (!userId) redirect("/");

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Create Event
        </h3>
      </section>

      <div className="wrapper my-8">
        <EventForm userId={userId!} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;