import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Code,
  Palette,
  Zap,
  Star,
  Users,
  Globe,
  Rocket,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logoutUser } from "../features/auth/authThunks";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
  easeInOut,
} from "motion/react";

const MainWebsite = () => {
  const [firstName, setFirstName] = useState("");
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const Colors = [  "#CE84CF","#e073c5","#DD335C", "#ff5e57", "#1E67C6",];
  const color = useMotionValue(Colors[0]);

  useEffect(() => {
    animate(color, Colors, {
      ease: easeInOut,
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%,#020617 50%, ${color})`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  useEffect(() => {
    const persistedAuth = localStorage.getItem("persist:auth");
    if (persistedAuth) {
      const parsedAuth = JSON.parse(persistedAuth);
      const user = JSON.parse(parsedAuth.user);
      setFirstName(user.firstName);
    }
  }, []);

  const handleLogout = async () => {
    if (loading) return;

    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Logout failed");
    }
  };

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "y") {
          e.preventDefault();
          navigate("/chat");
        }
      };
  
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

  return (
    <motion.div className="min-h-screen relative z-40 bg-transparent animate-fade-in">
      <motion.div
  style={{ backgroundImage }}
  className="fixed top-0 left-0 w-full h-full -z-10"
/>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-lg lg:backdrop-blur-none lg:bg-transparent">
        <div className="lg:container mx-auto px-3 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 md:space-x-3">
              <div className="bg-gradient-to-r to-rose-400 shadow shadow-white/30 p-2 rounded-lg backdrop-blur-3xl">
                <Zap className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Webify
              </h1>
            </div>
            <div className="space-x-2">
              <NavLink
                to="/chat"
                className="btn btn-dash btn-info text-xs hover:text-white  hover:scale-105 transition-transform"
              >
                Ai Website Builder
              </NavLink>
              <span
                onClick={handleLogout}
                disabled={loading}
                className={`btn btn-dash btn-error text-xs cursor-pointer  text-white transition-transform  ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? "Logging out..." : "Log out"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-slide-up">
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
              We Build
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient pb-3 ">
                Digital Dreams
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Transform your vision into stunning web experiences that
              captivate, engage, and convert. We craft digital solutions that
              make your brand shine.
            </p>

            <span className="block bg-gradient-to-r from-yellow-500 to-green-500 via-blue-400/80 text-3xl bg-clip-text text-transparent animate-gradient pb-4 ">
              Welcome {firstName}
            </span>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink
                to="/chat"
                className="btn btn-dash btn-ghost hover:text-black border border-white text-white px-8 py-4 rounded-full hover:scale-105 transition-transform flex items-center justify-center space-x-2 group"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-6">
        <div className="container mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-12">
            What We Do
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="w-8 h-8" />,
                title: "Web Development",
                description:
                  "Custom websites built with cutting-edge technologies for optimal performance and user experience.",
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "UI/UX Design",
                description:
                  "Beautiful, intuitive designs that tell your story and engage your audience effectively.",
              },
              {
                icon: <Rocket className="w-8 h-8" />,
                title: "Digital Strategy",
                description:
                  "Comprehensive digital strategies that drive growth and maximize your online presence.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl shadow-md hover:shadow-blue-500/30 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 group"
              >
                <div className="bg-gradient-to-r from-sky-300/40 shadow shadow-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-white">
                  {service.icon}
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">
                  {service.title}
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className=" py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                number: "500+",
                label: "Happy Clients",
              },
              {
                icon: <Globe className="w-8 h-8" />,
                number: "1000+",
                label: "Projects Completed",
              },
              {
                icon: <Star className="w-8 h-8" />,
                number: "5.0",
                label: "Average Rating",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                number: "24/7",
                label: "Support Available",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group p-2 rounded-2xl shadow shadow-blue-400/20"
              >
                <div className=" bg-gradient-to-r to-black/20 shadow shadow-sky-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-white">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r to-rose-400 shadow-md shadow-white/30 p-2 rounded-2xl">
              <Zap className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl pb-2 font-bold bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent">
              Webify
            </h1>
          </div>
          <p className="text-gray-400 mb-6">
            Ready to transform your digital presence? Let's create something
            amazing together.
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

export default MainWebsite;
