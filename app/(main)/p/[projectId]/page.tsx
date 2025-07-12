import { ProjectView } from "@/components/project/project-view"
import { generateProjectMetadata } from "@/lib/metadata"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ projectId: string }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  return generateProjectMetadata({ params })
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;

  if (isSupabaseEnabled) {
    const supabase = await createClient()
    if (supabase) {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        redirect("/")
      }

      // Verify the project belongs to the user
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", userData.user.id)
        .single()

      if (projectError || !project) {
        redirect("/")
      }
    }
  }

  return <ProjectView projectId={projectId} key={projectId} />
}