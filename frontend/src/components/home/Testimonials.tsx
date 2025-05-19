import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/lib/data";
import { useTheme } from "@/context/ThemeContext";

const Testimonials = () => {
  const { isDark } = useTheme(); // Access dark mode state

  return (
    <section className={`section-padding ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Don't just take our word for it. Here's what car owners and dealers
            have experienced using our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`border-none shadow-lg hover-scale transition-all duration-300 ${
                isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? 'text-yellow-500'
                          : isDark
                          ? 'text-gray-600'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                      {testimonial.name}
                    </h4>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;