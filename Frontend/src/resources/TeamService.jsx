

const TeamService = () => {
  const teamMembers = [
    { name: 'Alex Carter', role: 'General Manager', image: '/vikas.jpeg', bio: 'Leads our team with a vision for exceptional service.' },
    { name: 'Emma Wilson', role: 'Support Specialist', image: '/shreysh.jpeg', bio: 'Ensures every customer has a seamless experience.' },
    { name: 'Liam Brown', role: 'Vehicle Manager', image: '/vishal.jpeg', bio: 'Keeps our fleet in top condition for your journey.' },
  ];

  const services = [
    { title: 'Compact Cars', description: 'Fuel-efficient cars for solo or small group travel.', icon: '🚗', back: 'Book now for budget-friendly rides!' },
    { title: 'Luxury Sedans', description: 'High-end vehicles for a premium driving experience.', icon: '🏎️', back: 'Drive in style with our luxury fleet!' },
    { title: 'Family SUVs', description: 'Roomy vehicles for family trips or group adventures.', icon: '🚐', back: 'Perfect for group travel!' },
    { title: 'Express Airport Rides', description: 'Quick and reliable airport transfers.', icon: '🛫', back: 'Hassle-free airport commutes!' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Team Section with Parallax Effect */}
      <section className="relative py-24 bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url(https://via.placeholder.com/1920x600?text=Team+Background)' }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative container mx-auto px-4">
          <h2 className="text-5xl font-extrabold text-white text-center mb-16 tracking-wide drop-shadow-lg">
            Our Dedicated Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl transform hover:-translate-y-3 transition duration-500 "
              >

                <img
  src={member.image}
  alt={member.name}
  className="w-40 h-40 mx-auto rounded-full object-cover border-4 border-white mt-5 shadow-lg"
/>



                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-gray-600 font-medium">{member.role}</p>
                  <p className="text-gray-700 mt-3 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Flip Cards */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-extrabold text-white text-center mb-16 tracking-wide drop-shadow-lg">
            Explore Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className="group [perspective:1000px] h-80"
              >
                <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front of the card */}
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-xl p-8 text-center [backface-visibility:hidden]">
                    <div className="text-6xl mb-6">{service.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                    <p className="text-gray-600 mt-3">{service.description}</p>
                  </div>
                  {/* Back of the card */}
                  <div className="absolute inset-0 bg-indigo-700 rounded-2xl shadow-xl p-8 text-center text-white flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-lg font-semibold">{service.back}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamService;
