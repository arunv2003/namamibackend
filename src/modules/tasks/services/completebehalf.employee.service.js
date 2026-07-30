import { taskSchema } from "../models/task.model.js";
import { fieldSchema } from "../../fieldvisit/models/fieldvisit.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { Op } from "sequelize";

export const completeBehalfEmployeeService = {
  fetchCompletionField: async () => {
    const baseFields = [
      {
        name: "houseImage",
        label: "House Image",
        type: "text",
        placeholder: "Enter house image",
        required: true,
      },
      {
        name: "relation",
        label: "Relation",
        type: "select",
        placeholder: "Select relation",
        required: true,
        options: [
          { label: "Spouses", value: "spouses" },
          { label: "Son", value: "son" },
          { label: "Daughter", value: "daughter" },
          { label: "Neighbour", value: "neighbour" },
          { label: "Relative", value: "relative" },
          { label: "Self", value: "self" },
        ],
      },
      {
        name: "clientPhone",
        label: "Client Phone Number",
        type: "number",
        placeholder: "Enter client phone number",
        required: true,
      },
      {
        name: "collectPayment",
        label: "Collect Payment",
        type: "select",
        placeholder: "Collect Payment",
        required: true,
        options: [
          { label: "Yes Collect", value: "yes_collect" },
          { label: "No", value: "no" },
        ],
      },
      {
        name: "reason",
        label: "Reason",
        type: "text",
        placeholder: "Reason for Payment",
        required: true,
      },
      {
        name: "clientSegment",
        label: "Client Segment",
        type: "select",
        placeholder: "Client Segment",
        required: true,
        options: [
          { label: "Cold", value: "cold" },
          { label: "Hot", value: "hot" },
          { label: "Warm", value: "warm" },
        ],
      },
      {
        name: "ptpdate",
        label: "PTP Date",
        type: "datetime-local",
        placeholder: "PTP Date",
        required: true,
      },
      {
        name: "paymentType",
        label: "Payment Type",
        type: "select",
        required: true,
        options: [
          { label: "Cash", value: "cash" },
          { label: "ONLINE", value: "online" },
          { label: "Digital Mode", value: "digitalmode" },
        ],
      },
      {
        name: "paymentAmount",
        label: "Payment Amount",
        type: "number",
        placeholder: "Enter payment amount",
        required: true,
      },
      {
        name: "remark",
        label: "Remark",
        type: "text",
        placeholder: "Enter remark",
        required: true,
      },
      {
        name: "paymentProfImage",
        label: "Payment Prof Image",
        type: "text",
        placeholder: "Enter payment prof image",
        required: true,
      },
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "Enter location",
        required: true,
      },
      {
        name: "startDateTime",
        label: "Start Date Time",
        type: "datetime-local",
        placeholder: "Enter start date time",
        required: true,
      },
      {
        name: "completeDateTime",
        label: "Complete Date Time",
        type: "datetime-local",
        placeholder: "Enter complete date time",
        required: true,
      },
    ];

    return baseFields;
  },

  completeTask: async (taskIdentifier, formData, userId) => {
    // 1. Find the current task
    let currentTask;
    if (!isNaN(taskIdentifier)) {
      currentTask = await taskSchema.findByPk(taskIdentifier);
    }
    if (!currentTask) {
      currentTask = await taskSchema.findOne({
        where: { task_id: taskIdentifier },
      });
    }
    if (!currentTask) {
      currentTask = await taskSchema.findOne({
        where: { slug: taskIdentifier },
      });
    }
    if (!currentTask) {
      throw new ApiError(404, `Task '${taskIdentifier}' not found`);
    }

    const { collectPayment } = formData;
    const customerId = currentTask.customerId;
    const empId = currentTask.assigneeToEmployeeId || userId;

    const cleanDate = (val) => (val && val !== "" ? val : null);
    const cleanNum = (val) => (val !== "" && val !== null && val !== undefined && !isNaN(val) ? Number(val) : null);

    // 2. Mark current task as completed.
    // All form fields are now direct columns in the task schema.
    currentTask.status = "completed";
    currentTask.updatedBy = userId || currentTask.updatedBy;
    currentTask.houseImage = formData.houseImage || null;
    currentTask.relation = formData.relation || null;
    currentTask.clientPhone = formData.clientPhone || null;
    currentTask.collectPayment = formData.collectPayment || null;
    currentTask.reason = formData.reason || null;
    currentTask.clientSegment = formData.clientSegment || null;
    currentTask.ptpdate = cleanDate(formData.ptpdate);
    currentTask.paymentType = formData.paymentType || null;
    currentTask.paymentAmount = cleanNum(formData.paymentAmount);
    currentTask.remark = formData.remark || null;
    currentTask.paymentProfImage = formData.paymentProfImage || null;
    currentTask.location = formData.location || null;
    currentTask.startDateTime = cleanDate(formData.startDateTime) || currentTask.startDateTime;
    currentTask.completeDateTime = cleanDate(formData.completeDateTime);
    await currentTask.save();

    // 3. If collectPayment === "no" → create a new task with same base data
    let newTask = null;
    if (collectPayment === "no") {
      // Generate unique slug with suffix counter to prevent infinite loop
      let slugBase = generateSlug(currentTask.description || "task");
      let slug = slugBase;
      let slugCounter = 1;
      while (await taskSchema.findOne({ where: { slug } })) {
        slug = `${slugBase}-${slugCounter++}`;
      }

      // Generate unique task_id
      let task_id = generateUniqueId("TSK");
      while (await taskSchema.findOne({ where: { task_id } })) {
        task_id = generateUniqueId("TSK");
      }

      // Model columns from currentTask are copied directly.
      // Form fields are also direct columns now.
      newTask = await taskSchema.create({
        task_id,
        slug,
        taskType: currentTask.taskType,
        customerId: currentTask.customerId,
        description: currentTask.description,
        priority: currentTask.priority,
        assigneeToEmployeeId: currentTask.assigneeToEmployeeId,
        startDateTime: currentTask.startDateTime,
        endDateTime: currentTask.endDateTime,
        repeat: currentTask.repeat,
        frequency: currentTask.frequency,
        interval: currentTask.interval,
        time: currentTask.time,
        payment_type: currentTask.payment_type,
        status: "pending",
        createdBy: userId || currentTask.createdBy,
        updatedBy: userId || currentTask.updatedBy,
        // Completion form fields carried over to the new task
        houseImage: formData.houseImage || null,
        relation: formData.relation || null,
        clientPhone: formData.clientPhone || null,
        collectPayment: formData.collectPayment || null,
        reason: formData.reason || null,
        clientSegment: formData.clientSegment || null,
        ptpdate: cleanDate(formData.ptpdate),
        paymentType: formData.paymentType || null,
        paymentAmount: cleanNum(formData.paymentAmount),
        remark: formData.remark || null,
        paymentProfImage: formData.paymentProfImage || null,
        location: formData.location || null,
        completeDateTime: cleanDate(formData.completeDateTime),
        // Metadata about the previous task
        additionalFields: {
          previousTaskId: currentTask.task_id,
          customerId,
        },
      });
    }

    return {
      completedTask: currentTask,
      newTask: newTask || null,
      collectPayment,
    };
  },
};

export default completeBehalfEmployeeService;