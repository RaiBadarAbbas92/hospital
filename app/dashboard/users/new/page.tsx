import { UserForm } from "@/components/user-form"

export default function NewUserPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Add New User</h1>
      <UserForm />
    </div>
  )
}
