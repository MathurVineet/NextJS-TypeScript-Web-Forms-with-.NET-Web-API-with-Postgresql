/*
 * ProductModuleList.tsx
 * This component is created to view the list and remove the product.
 */
import React, { useState, useEffect } from "react";
import Utils from "@/utils";
import Image from "next/image";
import ProductRowForm from "./form";
import classnames from "classnames";
import { eResultCode } from "@/utils/enum";
import { useToast, useFetch, useModal } from "@/hooks";
import { TFilterModel } from "@/types/config";
import { FaPlus } from "react-icons/fa";
import {
  Button,
  Search,
  PageHeader,
  // Pagination,
  TableHead,
  Loader,
  Checkbox,
  Dropdown,
  DropdownOptionType,
  Popup,
  TableRow,
  Table,
  TableBody,
  TableColumn,
  Form,
} from "opexee-ui-library";
import { useRouter } from "next/router";
import { filterDefaultValue } from "@/utils/constants";
import { ToastType } from "@/state/toast/slice";
import DashboardLayout from "@/components/layout/dashboard";
import {
  FaCheck,
  FaRegFileAlt,
  FaSearch,
  FaTimes,
  FaTrash,
  FaTrashAlt,
} from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { faChevronDown, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { eRowStatus } from "@/utils/enum";
import {  ApiDeleteDbSchema, ApiGetDbSchemaList } from "@/utils/api.constant";
import { Pagination } from "@/components/pagination/pagination";
import { SingleValue } from "react-select";

type SchemaModule = {
  id: number;
  shortCode?: string;
  productName?: string;
  moduleName?: string;
  schemaName?: string
  remarks?: string;
  rowStatus: string;
}

export default function SchemaList() {
  const router = useRouter();
  const { post } = useFetch();
  const { onShowToast } = useToast();
  const { onShowModal } = useModal();
  const [modules, setProducts] = useState<Array<SchemaModule>>([]);
  const [isLoading, setLoading] = useState(false);
  const [filterModel, setFilter] = useState<TFilterModel>({
    ...filterDefaultValue,
    ...router.query,
  });

  const updateFilter = (newFilter: Record<string, any> = {}) => {
    const updatedFilter = {
      ...filterModel,
      ...newFilter,
    };
    router.push({
      query: Utils.getQueryString({
        searchText: updatedFilter.searchText,
        pageSize: updatedFilter.pageSize,
        currentPage: updatedFilter.currentPage,
        orderBy: updatedFilter.orderBy,
        orderType: updatedFilter.orderType,
        fromDate: updatedFilter.fromDate,
        toDate: updatedFilter.toDate,
        status: updatedFilter.status,
      }),
    });
    setFilter(updatedFilter);
  };

  useEffect(() => {
    if (router.isReady) {
      fetchProductModules({ ...filterModel , ...router.query });
    }
  }, [router.query]);

  const fetchProductModules = async (filterModel: TFilterModel) => {
    try {
      const payload = {
        filterModel: filterModel,
        data: {}
      };
      setLoading(true);
      const response = await post(ApiGetDbSchemaList, payload);
      if (response.dataResponse.returnCode === eResultCode.SUCCESS) {
        setProducts(response.data);
        setFilter(response.filterModel);
      } else {
        console.error("API response does not contain data:", response);
      }
    } catch (error) {
      console.error("Encountered Error! While fetching modules- ", error);
    } finally {
      setLoading(false);
    }
  };

  const onHandleEdit = (index: number) => {
    if (modules[0].rowStatus != eRowStatus.ADD) {
      const updateModules = [...modules];
      updateModules[index].rowStatus = eRowStatus.EDIT;
      setProducts(updateModules);
    }
  };

  const onHandleClose = (id: any) => {
    if (id > 0) {
      const updatedModules = modules.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            rowStatus: eRowStatus.SAVE,
          };
        }
        return product;
      });
      setProducts(updatedModules);
    } else {
      localStorage.setItem("modeContinue", JSON.stringify(false));
      removeModuleAtIndex(0);
    }
  };

  const removeModuleAtIndex = (indexToRemove: any) => {
    setProducts((prevModules) =>
      prevModules.filter((product, index) => index !== indexToRemove)
    );
  };

  const onHandleAdd = () => {
    const newProduct = { id: 0, rowStatus: eRowStatus.ADD};
    setProducts([newProduct, ...modules]);
    localStorage.setItem("modeContinue", JSON.stringify(true));
  };

  const onHandleRemoveDbSchema = async (id: number) => {
    try {
      const payload = {
        data: { id: id, rowStatus: eRowStatus.DELETE },
        filterModel,
      };
      // setLoading(true);
      const response = await post(ApiDeleteDbSchema, payload);
      if (response.dataResponse.returnCode == eResultCode.SUCCESS) {
        reloadRouter();
        onShowToast({
          type: ToastType.success,
          title: <FaCheck />,
          content: "Success",
        });
      } else {
        onShowToast({
          type: ToastType.error,
          title: <FaTimes />,
          content: "Error",
        });
      }
    } catch (error) {
      console.error("Encountered Error! While fetching modules- ", error);
    } finally {
      // setLoading(false);
    }
  };

  const reloadRouter = () => {
    router.replace({
      query: { ...router.query },
    });
  };

  const renderProductModule = (product: SchemaModule, index: number) => {
    if (
      [eRowStatus.ADD, eRowStatus.EDIT].includes(product.rowStatus as eRowStatus)
    ) {
      return (
        <ProductRowForm update={reloadRouter} index={index + 1} id={product.id} onHandleClose={onHandleClose} />
      );
    }

    return (
      <TableRow key={index}>
        <TableColumn classNames="w-[3%]" variant="centerAlign">
          <Checkbox
            name={`list.${index}.checkbox`}
            id={`list.${index}.checkbox`}
          />
        </TableColumn>
        <TableColumn classNames="w-[3%]" key={index} variant="centerAlign">
          {index + 1}
        </TableColumn>
        <TableColumn key={index} classNames="w-[10%] !p-[6px]">
          {
            <span>{product.productName}</span>
          }
        </TableColumn>
        <TableColumn classNames="w-[10%] !p-[6px]">
          {product.moduleName}
        </TableColumn>
        <TableColumn classNames="w-[12%] !p-[6px] ">
          {product.schemaName}
        </TableColumn>
        <TableColumn classNames="w-[10%] !p-[6px]">
          {product.remarks}
        </TableColumn>
        <TableColumn classNames="w-[18%]  !pr-2" variant="rightAlign">
          <div className="flex justify-end">
            <div
              className="pr-2 "
              onClick={() => {
                onHandleEdit(index);
              }}
            >
              <FaEdit color="#396077" size={15} className="cursor-pointer" />
            </div>
            <div
              onClick={() => {
                onShowModal({
                  content: "Are you sure you want to delete this record?",
                  showButton: true,
                  onSave: () => onHandleRemoveDbSchema(product.id),
                });
              }}
            >
              <img src="/assets/images/googleTrash.svg" alt="" />
            </div>
          </div>
        </TableColumn>
      </TableRow>
    );
  };

  const renderProductModules = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableColumn>
            <Loader />
          </TableColumn>
        </TableRow>
      );
    }
    return modules.map(renderProductModule);
  };

  const onHandleAddEdit = () => {
    // addNewTab("/dashboard/sample-form/form")
  };

  const onHandleDelete = () => {
    // router.push("sample-form");
  }

  const dropDownOption: DropdownOptionType[] = [
    { value: 1, label: "Edit Post" },
    { value: 2, label: "Remove Post" },
  ];

  return (
    <div className="pageBody">
      <PageHeader
        classNames="dropdown-max-w font-sans tableForm  sm:text-xs md:text-xs"
        icon={<FaRegFileAlt />}
        title={"DB Schema List"}
      >
        <Dropdown
          placeholder="Criteria One"
          classNames='!rounded-sm font-sans font-medium border-x border-y border-solid border-slate-300  pt-0.5  pb-0.5 border-black w-[10%]'
          options={dropDownOption}
        ></Dropdown>
        <Dropdown placeholder="Criteria Two"
          classNames='!rounded-sm font-sans font-medium border-x border-y border-solid border-slate-300  pt-0.5  pb-0.5 border-black w-[10%]' options={dropDownOption}></Dropdown>
        <Dropdown placeholder="This week"
          classNames='!rounded-sm font-sans  font-medium border-x border-y border-solid border-slate-300 pt-0.5  pb-0.5 border-black w-[10%]' options={dropDownOption}></Dropdown>
        <div className=" d-flex !text-xs border-slate-300  border-x border-y border-solid items-center px-1.5 py-1  rounded-sm">
          <Image src={"/assets/images/up_down_arrow 1.svg"} alt="icon" width={20} height={15} />
          <Image src={"/assets/images/down_arrow 1.svg"} alt="icon" width={30} height={15} />
          <Popup icon={faChevronDown} className="">
            <ul className={classnames("arrowPointer", "actionButtons")}>
              <li className="actions" onClick={onHandleAddEdit}>
                <FaEdit color="#396077" />
                Edit
              </li>
              <li
                className="actions"
                onClick={() => {
                  onShowModal({
                    content: "Are you sure you want to delete this record?",
                    showButton: true,
                    onSave: () => onHandleDelete(),
                  });
                }}
              >
                <FaTrashAlt />
                Delete
              </li>
            </ul>
          </Popup></div>
        <div className="w-[75%] font-sans font-medium">
          <Search
            icon={<FaSearch />}
            classNames="py-1 !rounded-sm"
            iconClassNames="!text-xs !left-auto !right-4 !top-3.5"
            searchText={filterModel.searchText}
            onInputChange={(searchText: string) => updateFilter({ searchText })}
          />
        </div>
        <Image className="bg-primary px-1 py-1 rounded-sm" src={"/assets/images/filter 1.svg"} alt="icon" width={20} height={15} />
        <Image className="bg-primary px-1 py-1 rounded-sm" src={"/assets/images/maintenance_1 1.svg"} alt="icon" width={20} height={15} />
        <div className=" bg-primary  font-sans font-medium d-flex text-white items-center gap-2 px-2 py-1 text-xs rounded-sm">
          Action
          <Popup icon={faEllipsisV}>
            <ul className={classnames("arrowPointer", "actionButtons")}>
              <li className="actions" onClick={onHandleAddEdit}>
                <FaEdit color="#396077" />
                Edit
              </li>
              <li
                className="actions"
                onClick={() => {
                  onShowModal({
                    content: "Are you sure you want to delete this record?",
                    showButton: true,
                    onSave: () => onHandleDelete(),
                  });
                }}
              >
                <img src="/assets/images/googleTrash.svg" alt="" />
                Delete
              </li>
            </ul>
          </Popup></div>
      </PageHeader>
      <div className="listContainer">
        <div className="tableContainer font-sans">          
            <Table>
              <TableRow
              >
                <TableHead classNames="w-[3%]" variant="centerAlign">
                  <Checkbox
                    name="menucheckbox"
                    id="menucheckbox"
                  />
                </TableHead>
                <TableHead
                  variant="centerAlign"
                  orderType={filterModel.orderType}
                  orderBy={filterModel.orderBy}
                  onSortKeyChange={(orderBy: string, orderType: string) => {
                    updateFilter({ orderBy, orderType });
                  }}
                  classNames="w-[3%]"
                >
                  Sr
                </TableHead>
                <TableHead
                  variant="centerAlign"
                  sortKey="productName"
                  orderType={filterModel.orderType}
                  orderBy={filterModel.orderBy}
                  onSortKeyChange={(orderBy: string, orderType: string) => {
                    updateFilter({ orderBy, orderType });
                  }}
                  classNames="w-[10%]"
                >
                  Products
                </TableHead>
                <TableHead
                  variant="centerAlign"
                  sortKey="moduleName"
                  orderType={filterModel.orderType}
                  orderBy={filterModel.orderBy}
                  onSortKeyChange={(orderBy: string, orderType: string) => {
                    updateFilter({ orderBy, orderType });
                  }}
                  classNames="w-[12%]"
                >
                  Module Name
                </TableHead>
                <TableHead
                  variant="centerAlign"
                  sortKey="schemaName"
                  orderType={filterModel.orderType}
                  orderBy={filterModel.orderBy}
                  onSortKeyChange={(orderBy: string, orderType: string) => {
                    updateFilter({ orderBy, orderType });
                  }}
                  classNames="w-[10%]"
                >
                  Schema Name
                </TableHead>
                <TableHead
                  variant="centerAlign"
                  sortKey="remarks"
                  orderType={filterModel.orderType}
                  orderBy={filterModel.orderBy}
                  onSortKeyChange={(orderBy: string, orderType: string) => {
                    updateFilter({ orderBy, orderType });
                  }}
                  classNames="w-[10%]"
                >
                  Remarks
                </TableHead>
                <TableHead classNames="w-[18%] !pr-2" variant="rightAlign">
                  <Button
                    type="button"
                    classNames="!w-auto !bg-transparent border-none flex outline-none !p-0"
                    disabled={modules?.[0]?.rowStatus === eRowStatus.ADD}
                    onClick={onHandleAdd}
                  >
                    <FaPlus color="#396077" className={`rounded-full cursor-pointer ${modules && modules[0]?.rowStatus === eRowStatus.ADD ? 'opacity-50' : ''}`} />
                  </Button>
                </TableHead>
              </TableRow>
              <TableBody>
                {renderProductModules()}
              </TableBody>
            </Table>         
        </div>
      </div>
      <div className="footer">
        <Pagination
          classNames=""
          pageSize={filterModel.pageSize}
          filterRowsCount={filterModel.filterRowsCount}
          totalRows={filterModel.totalRows}
          currentPage={filterModel.currentPage}
          onPageChange={(currentPage: number) =>
            updateFilter({ currentPage })
          }
          onPageSizeChange={(pageSize: number) => updateFilter({ pageSize })}
          orderBy={filterModel.orderBy}
          orderType={filterModel.orderType}
        />
      </div>
    </div>
  );
}

SchemaList.getLayout = DashboardLayout;