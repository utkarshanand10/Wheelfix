// import { Card } from "@/components/ui/card";

// const HowWeWork = () => {
//   const steps = [
//     {
//       step: "Step 1",
//       title: "Select required service for vehicle",
//       description: "Provide details about the issue, such as the type of service needed, the make and model of the vehicle, and their location",
//       icon: "🔍"
//     },
//     {
//       step: "Step 2", 
//       title: "Schedule pick up and drop",
//       description: "We provide pick up and drop facilities for all service booked",
//       icon: "📅"
//     },
//     {
//       step: "Step 3",
//       title: "Track your vehicle repair", 
//       description: "We ensure transparent repair of your vehicle, we provide facilities of live streaming of your vehicle",
//       icon: "📱"
//     },
//     {
//       step: "Step 4",
//       title: "Drop your vehicle",
//       description: "After the service completed, we drop your vehicle at your doorstep.",
//       icon: "🚗"
//     }
//   ];

//   return (
//     <section className="py-20 bg-gray-50">
//       <div className="container mx-auto px-4">
//         {/* Section Header */}
//         <div className="text-center mb-16">
//           <h2 className="text-4xl font-bold text-gray-900 mb-4">HOW WE WORK</h2>
//         </div>

//         {/* Steps Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {steps.map((step, index) => (
//             <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2x2 rounded-2x2 transform transition duration-500 ease-out hover:scale-120 hover:-translate-y-1 p-8 text-center hover:shadow-lg transition-shadow">
//               <div className="mb-6">
//                 <div className="text-6xl mb-4">{step.icon}</div>
//                 <div className="text-accent font-bold text-lg mb-2">{step.step}</div>
//               </div>
              
//               <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
//                 {step.title}
//               </h3>
              
//               <p className="text-gray-600 text-sm leading-relaxed">
//                 {step.description}
//               </p>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HowWeWork;

import { Card } from "@/components/ui/card";

const HowWeWork = () => {
  const steps = [
    {
      step: "Step 1",
      title: "Select required service for vehicle",
      description:
        "Provide details about the issue—service type, vehicle make/model, and your location.",
      icon: "🔍",
    },
    {
      step: "Step 2",
      title: "Schedule pick up and drop",
      description: "We provide pickup and drop facilities for all booked services.",
      icon: "📅",
    },
    {
      step: "Step 3",
      title: "Track your vehicle repair",
      description:
        "We ensure transparent repairs and offer live streaming of your vehicle’s service.",
      icon: "📱",
    },
    {
      step: "Step 4",
      title: "Drop at your doorstep",
      description:
        "After the service is completed, we drop your vehicle at your doorstep.",
      icon: "🚗",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">HOW WE WORK</h2>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <Card
              key={i}
              className="
                group
                p-8 text-center
                rounded-2xl border border-gray-200 bg-white
                shadow-sm
                transition-transform duration-300
                ease-[cubic-bezier(0.28,0.84,0.42,1)]
                hover:scale-105 hover:-translate-y-1 hover:shadow-xl
              "
            >
              <div className="mb-6">
                <div className="text-6xl mb-4 select-none">{s.icon}</div>
                <div className="text-accent font-bold text-lg mb-2">{s.step}</div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                {s.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed">
                {s.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
