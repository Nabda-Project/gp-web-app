import { redirect } from "next/navigation";

export default async function PatientChatAlias({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  redirect(`/chats/${patientId}`);
}
