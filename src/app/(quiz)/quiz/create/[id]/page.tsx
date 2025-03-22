type Params = {
  id: string
}
const page = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params

  return <div>{id}</div>
}
export default page
