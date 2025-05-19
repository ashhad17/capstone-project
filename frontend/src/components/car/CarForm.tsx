import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';

const carFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.number().min(1, {
    message: "Price must be at least 1.",
  }),
  year: z.number().min(1900, {
    message: "Year must be at least 1900.",
  }),
  mileage: z.number().min(0, {
    message: "Mileage must be at least 0.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  condition: z.enum(['new', 'used'], {
    required_error: "Please select a condition.",
  }),
  fuel: z.string().optional(),
  transmission: z.string().optional(),
});

interface CarFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  carId?: string;
  initialData?: z.infer<typeof carFormSchema>;
}

const CarForm: React.FC<CarFormProps> = ({ onSuccess, onCancel, carId, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      price: 0,
      year: 2023,
      mileage: 0,
      location: "",
      imageUrl: "",
      condition: "used",
      fuel: "",
      transmission: "",
    },
    mode: "onChange",
  });

  const onSubmit = useCallback(async (values: z.infer<typeof carFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Form values:", values);
      toast({
        title: "Success",
        description: "Car listed successfully!",
      });
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to list car. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, toast]);

  const handleAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Car Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the car"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Price"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Year"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Mileage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Mileage"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Image URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="fuel"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Fuel Type (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Fuel Type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Transmission (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Transmission" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "List Car"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CarForm;
