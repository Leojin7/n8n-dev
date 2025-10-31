
import { cn } from "@/lib/utils";
const page = () => {

  const something = true;

  return (

    <div className={cn("text-blue-400 font-extrabold", something === true && "text-red-400",)}>

      Hello World
    </div>
  )

}


export default page;