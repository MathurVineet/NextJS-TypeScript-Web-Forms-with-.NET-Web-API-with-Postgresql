/*
 * TableForm.tsx
 * This component is created to save the list and edit the product.
 */

import React, { useEffect, useState } from "react";
import * as yup from "yup";
import CommonUtil from "@/utils/common";
import { eResultCode } from "@/utils/enum";
import { useToast, useFetch } from "@/hooks";
import {
    Checkbox,
    DropdownOptionType,
    Form,
    // FormDropdown,
    FormInput,
    TableColumn,
    TableRow,
} from "opexee-ui-library";
import { ToastType } from "@/state/toast/slice";
import { yupResolver } from "@hookform/resolvers/yup";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { FaCheck, FaSave, FaTimes } from "react-icons/fa";
import DashboardLayout from "@/components/layout/dashboard";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./table-form.module.css";
import { ApiAddEditDbSchemaList, ApiGetDbSchemaById, ApiGetDbSchemaList, ApiGetProductList, ApiGetProductModuleList } from "@/utils/api.constant";
import { MultiValue, SingleValue } from "react-select";
import { TFilterModel } from "@/types/config";
import { filterDefaultValue } from "@/utils/constants";
import router from "next/router";
import { FormDropdown } from "@/components/form/form-dropdown";

type SchemaModule = {
    id?: number;
    shortCode?: string;
    productName?: SingleValue<DropdownOptionType>;
    moduleName?: SingleValue<DropdownOptionType>;
    remarks?: string;
    rowStatus?: string;
    productId?: number;
    schemaName?: string;
    moduleId?: number;
    moduleList?: DropdownOptionType[];
};

type SchemaRowProps = {
    update: () => void;
    onHandleClose: (Id?: number) => void;
    index: number;
    id: number;
};

const validationSchema = yup.object({
    shortCode: yup.string().required(),
    productName: yup.object(
        {
            value: yup.number().required("Product is required"),
            label: yup.string(),
        })
        .test({
            test: (value) => value.value != undefined,
            message: "Product is required",
        }),
    moduleName: yup.object(
        {
            value: yup.number().required("Product Module is required"),
            label: yup.string(),
        })
        .test({
            test: (value) => value.value != undefined,
            message: "Product Module is required",
        }),
    remarks: yup.string().default(""),
    rowStatus: yup.string().default("A"),
});

export default function DbSchemaRowForm(props: SchemaRowProps) {
    const { post, getApiEndpoint } = useFetch();
    const { onShowToast, onErrorToast } = useToast();
  const [filterModel, setFilter] = useState<TFilterModel>({
    ...filterDefaultValue,
    ...router.query,
  });

    const [isLoading, setLoading] = useState(true);
    const { update, index, id, onHandleClose } = props;
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<SchemaModule>({
        mode: "all",
        resolver: yupResolver(validationSchema) as unknown as Resolver<SchemaModule>,
    });

    const formValues = getValues();

    useEffect(() => {
        fetchSchemaById(id);
        
    }, []);

    const setFieldValue = (key: any, value: any) => {
        setValue(key, value, {
            shouldValidate: true,
            shouldTouch: true,
        });
    };

    const fetchSchemaById = async (id: number) => {
        try {
            const payload = {
                data: {
                    id
                }
            };
            const response = await post(ApiGetDbSchemaById, payload);
            if (response.dataResponse.returnCode == eResultCode.SUCCESS) {
                const { filterModel: updatedFilter, data } = response;
                reset({
                    ...data[0], 
                    productName: {
                        value: response.data[0].productId,
                        label: "",
                    },
                    moduleName: {
                        value: response.data[0].moduleId,
                        label: "",
                    },
                })
                console.log("Formvalues", formValues)
                fetchModuleList(data[0].productId);
            }
        } catch (error) {
            console.error("Error! While fetching measurement type: ", error);
        }
        setLoading(false);
    };


    const onHandleChangeProduct = (
        newValue: SingleValue<DropdownOptionType> | MultiValue<DropdownOptionType>
      ) => {
        const value = newValue as DropdownOptionType;
        setFieldValue('productName', value);
        setFieldValue('moduleName', {});

        fetchModuleList( value?.value as number);
      };
     
    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    const fetchModuleList = async (
        productId: number,
      ) => {
        console.log("Formvalues1", formValues)
        try {
          
          const payload = {
            filterModel: filterModel,
            data: {
              productId: productId,
            },
          };
          const response = await post(ApiGetProductModuleList, payload);
          if (response.dataResponse.returnCode === eResultCode.SUCCESS) {
            const { data } = response;
            const moduleList = data.map((module: any) => ({
                value: module.id,
                label: module.moduleName
            }));
                        setFieldValue(`moduleList`, moduleList);
          } else {
            onErrorToast(response.dataResponse.description);
          }
        } catch (error) {
          console.error("Error! While fetching db table type: ", error);
        } finally {
          setLoading(false);
        }
      };

      const onSubmit = async (value: SchemaModule) => {
        try {
            const payload = {
                data: {
                    ...value,
                    productId: value.productName?.value,
                    productName: value.productName?.label,
                    moduleId: value.moduleName?.value,
                    moduleName: value.moduleName?.label
                }
                ,
            };
            const response = await post(ApiAddEditDbSchemaList, payload);
            if (response.dataResponse.returnCode == eResultCode.SUCCESS) {
                update();
                onShowToast({
                    type: ToastType.success,
                    title: <FaCheck />,
                    content: "Success",
                });
            } else {
                onShowToast({
                    type: ToastType.error,
                    title: <FaTimes />,
                    content: response.dataResponse.description,
                });
            }
        } catch (error) {
            console.error("Encountered Error! While fetching schema- ", error);
        }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            event.preventDefault();
            onSubmit(formValues);
        }
    };

    return (
        <TableRow key={index} classNames="TableFormRow">
            <TableColumn classNames="w-[3%] !p-[0px]" variant="centerAlign">
                <Checkbox
                    name={`list.${index}.checkbox`}
                    id={`list.${index}.checkbox`}
                />
            </TableColumn>
            <TableColumn classNames="w-[3%] !p-[0px]" variant="centerAlign">
                {index}
            </TableColumn>
            <TableColumn classNames={`w-[10%] !p-[0px]`}>
                <FormDropdown
                    valueKey="id"
                    labelKey="productName"
                    name="productName"
                    isCreatable={false}
                    value={formValues.productName}
                    placeholder="Select Product"
                    error={errors.productName?.message}
                    apiUrl={getApiEndpoint(ApiGetProductList)}
                    onChange={(newValue) => {
                        onHandleChangeProduct(newValue);
                      }}
                />
            </TableColumn>
            <TableColumn classNames={`w-[10%] !p-[0px]`}>
                <FormDropdown
                    name="moduleName"
                    isCreatable={false}
                    value={formValues.moduleName}
                    options={formValues.moduleList}
                    placeholder="Select Product Module"
                    error={errors.moduleName?.message}
                    onChange={(selected: any) => {
                        setFieldValue("moduleName", selected);
                    }}
                />
            </TableColumn>
            <TableColumn classNames="w-[10%] !p-[0px]">
                <FormInput
                    key={index}
                    name={`schemaName`}
                    autoFocus={true}
                    error={errors.schemaName?.message}
                    register={register}
                    placeholder="Enter Schema"
                    onChange={(event) => setFieldValue(`schemaName`, event.target.value)}
                    onKeyPress={CommonUtil.validateEnterKey}
                ></FormInput>
            </TableColumn>
            <TableColumn classNames="w-[10%] !p-[0px]">
                <FormInput
                    key={index}
                    name={`remarks`}
                    error={errors.remarks?.message}
                    register={register}
                    placeholder="Enter Remark"
                    onChange={(event) => setFieldValue(`remarks`, event.target.value)}
                    onKeyPress={CommonUtil.validateEnterKey}
                ></FormInput>
            </TableColumn>
            <TableColumn classNames="w-[18%] !p-[0px]  !pr-2" variant="rightAlign">
                <div className="flex justify-end">
                    <div
                        className={"pr-3"}
                    >
                        <FaSave
                            type="submit"
                            className={styles.saveIcon}
                            onClick={ () => onSubmit(formValues)}
                        />
                    </div>
                    <div
                    >
                        <FontAwesomeIcon
                            className="cursor-pointer"
                            icon={faXmark as IconProp}
                            size="lg"
                            onClick={() => {
                                onHandleClose(id);
                            }}
                        />
                    </div>
                </div>
            </TableColumn>  
        </TableRow>
    );
}
DbSchemaRowForm.getLayout = DashboardLayout;
