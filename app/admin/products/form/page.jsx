"use client";

import { useEffect, useState } from "react";
import BasicDetails from "./components/BasicDetails";
import Images from "./components/Images";
import Description from "./components/Description";
import { Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import {
    createNewProduct,
    updateProduct,
} from "@/lib/firestore/products/write";
import { useRouter, useSearchParams } from "next/navigation";
import { getProduct } from "@/lib/firestore/products/read_server";
import { getCldImageUrl } from "next-cloudinary";

export default function Page() {
    const [data, setData] = useState(null);
    const [featureImage, setFeatureImage] = useState(null);
    const [imageList, setImageList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();

    const router = useRouter();

    const id = searchParams.get("id");

    const fetchData = async () => {
        try {
            const res = await getProduct({ id: id });
            if (!res) {
                throw new Error("Product Not Found");
            } else {
                setData(res);
            }
        } catch (error) {
            toast.error(error?.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const handleData = (key, value) => {
        setData((prevData) => {
            return {
                ...(prevData ?? {}),
                [key]: value,
            };
        });
    };

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const url = getCldImageUrl({
                width: 960,
                height: 600,
                src: featureImage,
            });
            const imageUrls = imageList.map((image) =>
                getCldImageUrl({
                    width: 960,
                    height: 600,
                    src: image.publicId,
                })
            );
            await createNewProduct({
                data: data,
                featureImage: url,
                imageList: imageUrls,
            });
            setData(null);
            setFeatureImage(null);
            setImageList([]);
            toast.success("Product is successfully Uploaded!");
        } catch (error) {
            console.log(error?.message);
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            let updatedFeatureImage = featureImage;
            let updatedImageList = imageList;

            if (featureImage) {
                updatedFeatureImage = getCldImageUrl({
                    width: 960,
                    height: 600,
                    src: featureImage,
                });
            }

            if (imageList && imageList.length > 0) {
                updatedImageList = imageList.map((image) =>
                    getCldImageUrl({
                        width: 960,
                        height: 600,
                        src: image.publicId,
                    })
                );
            }

            await updateProduct({
                data: data,
                featureImage: updatedFeatureImage,
                imageList: updatedImageList,
            });

            setData(null);
            setFeatureImage(null);
            setImageList([]);
            toast.success("Product is updated successfully!");
            router.push(`/admin/products`);
        } catch (error) {
            console.log(error?.message);
            toast.error(error?.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
            }}
            className="flex flex-col gap-4 p-5"
        >
            <div className="flex justify-between w-full items-center">
                <h1 className="font-semibold">
                    {id ? "Update Product" : "Create New Product"}
                </h1>
                <Button
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    type="submit"
                    className="bg-transparent text-xs text-red-600 border border-red-600 rounded-full"
                    onClick={(e) => {
                        e.preventDefault();
                        if (id) {
                            handleUpdate();
                        } else {
                            handleCreate();
                        }
                    }}
                >
                    {id ? "Update" : "Create"}
                </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1 flex">
                    <BasicDetails data={data} handleData={handleData} />
                </div>
                <div className="flex-1 flex flex-col gap-5 h-full">
                    <Images
                        data={data}
                        featureImage={featureImage}
                        setFeatureImage={setFeatureImage}
                        imageList={imageList}
                        setImageList={setImageList}
                    />
                    <Description data={data} handleData={handleData} />
                </div>
            </div>
        </form>
    );
}