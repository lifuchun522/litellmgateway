package cloud.joysky.llmgateway.open.controller;

import cloud.joysky.llmgateway.common.annotation.Log;
import cloud.joysky.llmgateway.common.core.controller.BaseController;
import cloud.joysky.llmgateway.common.core.domain.AjaxResult;
import cloud.joysky.llmgateway.common.core.page.TableDataInfo;
import cloud.joysky.llmgateway.common.enums.BusinessType;
import cloud.joysky.llmgateway.open.domain.OpenApp;
import cloud.joysky.llmgateway.open.service.OpenManageService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/admin/open/app")
public class OpenAppController extends BaseController
{
    private static final Logger log = LoggerFactory.getLogger(OpenAppController.class);

    private final OpenManageService openManageService;

    public OpenAppController(OpenManageService openManageService)
    {
        this.openManageService = openManageService;
    }

    @GetMapping()
    public String app()
    {
        return "open/app/index";
    }

    @PostMapping("/list")
    @ResponseBody
    public TableDataInfo list(OpenApp app)
    {
        startPage();
        List<OpenApp> list = openManageService.selectAppList(app);
        return getDataTable(list);
    }

    @GetMapping("/add")
    public String add()
    {
        return "open/app/add";
    }

    @Log(title = "Open应用", businessType = BusinessType.INSERT)
    @PostMapping("/add")
    @ResponseBody
    public AjaxResult addSave(OpenApp app)
    {
        log.info("[OpenAPI] 新增应用请求: appName={}", app.getAppName());
        app.setsCreateBy(getLoginName());
        return toAjax(openManageService.insertApp(app));
    }

    @GetMapping("/edit/{id}")
    public String edit(@PathVariable("id") Long id, ModelMap mmap)
    {
        mmap.put("app", openManageService.selectAppById(id));
        return "open/app/edit";
    }

    @Log(title = "Open应用", businessType = BusinessType.UPDATE)
    @PostMapping("/edit")
    @ResponseBody
    public AjaxResult editSave(OpenApp app)
    {
        log.info("[OpenAPI] 修改应用请求: sId={}, appName={}", app.getsId(), app.getAppName());
        app.setsUpdateBy(getLoginName());
        return toAjax(openManageService.updateApp(app));
    }

    @Log(title = "Open应用", businessType = BusinessType.DELETE)
    @PostMapping("/remove")
    @ResponseBody
    public AjaxResult remove(String ids)
    {
        log.info("[OpenAPI] 删除应用请求: ids={}", ids);
        return toAjax(openManageService.deleteAppByIds(ids));
    }

    @Log(title = "Open应用", businessType = BusinessType.UPDATE)
    @PostMapping("/resetSecret")
    @ResponseBody
    public AjaxResult resetSecret(Long id)
    {
        log.info("[OpenAPI] 重置密钥请求: appId={}", id);
        String newSecret = openManageService.resetSecret(id);
        return AjaxResult.success("重置成功", newSecret);
    }
}
