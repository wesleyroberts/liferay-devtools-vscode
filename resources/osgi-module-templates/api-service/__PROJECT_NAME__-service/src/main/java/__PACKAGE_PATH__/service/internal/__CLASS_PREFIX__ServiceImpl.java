package __PACKAGE_NAME__.service.internal;

import __PACKAGE_NAME__.api.__CLASS_PREFIX__Service;
import org.osgi.service.component.annotations.Component;

@Component(service = __CLASS_PREFIX__Service.class)
public class __CLASS_PREFIX__ServiceImpl implements __CLASS_PREFIX__Service {

    @Override
    public String getMessage() {
        return "Hello from __PROJECT_TITLE__";
    }
}
